pragma solidity ^0.4.2;

import "./zeppelin/ownership/Ownable.sol";
import './zeppelin/lifecycle/Killable.sol';
import './Marketplace.sol';


/*
* Store 
*
* This is the main contract for the Store implementation.
*/
contract Stores is Ownable, Killable {
	address public marketplaceId; 
	Marketplace public marketplaceInstance; 

	constructor(address marketplaceContract) public {
		marketplaceInstance = Marketplace(marketplaceContract);
		marketplaceId = marketplaceContract; 
	}

	struct Storefront {
		bytes32 id; 
		string name;
		address owner; 
		uint balance; 
	}

	struct Product {
		bytes32 id; 
		string name; 
		string description; 
		uint price; 
		uint qty; 
		bytes32 storefrontId; 
	}

	event StorefrontCreated (
		bytes32 id, 
		string name, 
		address owner, 
		uint totalStores);

	event StorefrontRemoved (
		bytes32 id);

	event ProductCreated (
		bytes32 id, 
		string name, 
		string description, 
		uint price, 
		uint qty, 
		bytes32 storefrontId);

	event ProductRemoved (
		bytes32 productId, 
		bytes32 storefrontId);

	event PriceUpdated (
		bytes32 productId,
		uint oldPrice,
		uint newPrice);

	event ProductSold (
		bytes32 productId,
		bytes32 storefrontId,
		uint price,
		uint qty,
		uint total,
		address buyer,
		uint newQuantity);

	mapping (address => bytes32[]) public storefronts; 
	mapping (bytes32 => Storefront) public storefrontById;
	mapping (bytes32 => bytes32[]) public inventories; 
	mapping (bytes32 => Product) public productById;

	modifier onlyStoreOwner() {
		if (marketplaceInstance.checkStoreOwnerStatus(msg.sender) == true)
			_;
	}

	modifier onlyStorefrontOwner(bytes32 id) {
		if (storefrontById[id].owner == msg.sender)
			_; 
	}

	function getBalance() 
	constant
	public 
	returns (uint) {
		return address(this).balance;
	}

	function createStorefront(string name) 
	onlyStoreOwner 
	public 
	returns (bytes32) {
		bytes32 id = keccak256(abi.encodePacked(msg.sender, name, now));
		Storefront memory s = Storefront(id, name, msg.sender, 0);
		storefronts[msg.sender].push(s.id);
		storefrontById[id] = s;
		emit StorefrontCreated(id, name, msg.sender, getStorefrontCount(msg.sender));
		return s.id; 
	}

	function removeStorefront(bytes32 id) 
	onlyStorefrontOwner(id) 
	public {
		Storefront memory sf = storefrontById[id]; 
		bytes32 [] storage inventory = inventories[id]; 

		// Delete all products from storefront 
		for (uint i=0; i<inventory.length; i++) {
			delete productById[inventory[i]];
			delete inventory[i];
		}
		// Remove from storefronts mapping
		uint sfCount = storefronts[msg.sender].length; 
		for(i=0; i<sfCount; i++) {
			if (storefronts[msg.sender][i] == id) {
				storefronts[msg.sender][i] = storefronts[msg.sender][sfCount-1]; 
				delete storefronts[msg.sender][sfCount-1];
				break;
			}
		}
		// Remove from storeFrontsById 
		delete storefrontById[id];
		emit StorefrontRemoved(id);
	}

	function getStorefrontCount(address owner) 
	constant 
	public 
	returns (uint) {
		uint initialCount = storefronts[owner].length;
		for(uint i=0; i<storefronts[owner].length; i++)
			if (storefronts[owner][i] == 0x0000000000000000000000000000000000000000000000000000000000000000)
				initialCount -= 1; 
		return initialCount;
	}

	function getStorefrontsId(address owner, uint storefrontIndex) 
	constant 
	public 
	returns (bytes32) {
		return storefronts[owner][storefrontIndex];
	}

	function getStorefrontBalance(bytes32 storefrontId) 
	constant 
	public 
	returns (uint) {
		return storefrontById[storefrontId].balance;
	}

	function addProduct(bytes32 storefrontId, string name, string description, uint price, uint qty) 
	public 
	onlyStorefrontOwner(storefrontId) 
	returns (bytes32) {
		bytes32 productId = keccak256(abi.encodePacked(msg.sender, storefrontId, name, description, price, qty)); 
		Product memory p = Product(productId, name, description, price, qty, storefrontId); 
		inventories[storefrontId].push(productId); 
		productById[productId] = p;
		emit ProductCreated(productId, name, description, price, qty, storefrontId);
		return p.id; 
	}

	function updateProductPrice(bytes32 storefrontId, bytes32 productId, uint newPrice) 
	onlyStorefrontOwner(storefrontId) 
	public {
		Product product = productById[productId];
		uint oldPrice = product.price;
		productById[productId].price = newPrice;
		emit PriceUpdated(productId, oldPrice, newPrice);
	}

	function getProductPrice(bytes32 productId) 
	constant 
	public 
	returns (uint) {
		return productById[productId].price;
	}

	function removeProduct(bytes32 storefrontId, bytes32 productId) 
	onlyStorefrontOwner(storefrontId) 
	public {
		bytes32[] inventory = inventories[storefrontId]; 
		uint productCount = inventory.length; 

		for(uint i=0; i<productCount; i++) {
			if (inventory[i] == productId) {
				inventory[i] = inventory[productCount-1];
				delete inventory[productCount-1];
				delete productById[productId];
				emit ProductRemoved(productId, storefrontId);
				break;
			}
		}
	}

	function getProductCount(bytes32 storefrontId) 
	constant 
	public 
	returns (uint) {
		uint count = inventories[storefrontId].length;
		for(uint i=0; i<count; i++) {
			if (inventories[storefrontId][i] == 0x0000000000000000000000000000000000000000000000000000000000000000)
				count -= 1;
		}
		return count;
	}

	function getProductId(bytes32 storefrontId, uint productIndex) 
	public 
	returns (bytes32) {
		return bytes32(inventories[storefrontId][productIndex]); 
	}


	function purchaseProduct(bytes32 storefrontId, bytes32 productId, uint qty) payable returns (bool) {
		// Fetch product from inventory and perform checks 
		Product product = productById[productId];
		uint total =  product.price*qty;
		require(msg.value >= total);
		require(qty <= product.qty);

		// If amount sent is too large, refund the difference
		uint refund = 0; 
		if (msg.value > total) {
			refund = msg.value - total;
			msg.sender.transfer(refund);
		}

		// Update product and storefront attributes
		product.qty -= qty;
		storefrontById[storefrontId].balance += product.price*qty;
		emit ProductSold(productId, storefrontId, product.price, qty, total, msg.sender, product.qty);
		return true;
	}
}