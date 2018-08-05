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
		address buyer);

	mapping (address => bytes32[]) public storefronts; 
	mapping (bytes32 => Storefront) public storefrontById;
	mapping (bytes32 => Product []) public inventories; 

	modifier onlyStoreOwner() {
		if (marketplaceInstance.checkStoreOwnerStatus(msg.sender) == true)
			_;
	}

	modifier onlyStorefrontOwner(bytes32 id) {
		if (storefrontById[id].owner == msg.sender)
			_; 
	}

	function createStorefront(string name) onlyStoreOwner public returns (bytes32) {
		bytes32 id = keccak256(msg.sender, name, now);
		Storefront memory s = Storefront(id, name, msg.sender, 0);
		storefronts[msg.sender].push(s.id);
		storefrontById[id] = s;
		emit StorefrontCreated(id, name, msg.sender, getStorefrontCount(msg.sender));
		return s.id; 
	}

	function removeStorefront(bytes32 id) onlyStorefrontOwner(id) public {
		Storefront memory sf = storefrontById[id]; 
		Product [] storage inventory = inventories[id]; 

		// Delete all products from storefront 
		for (uint i=0; i<inventory.length; i++) {
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

	function getStorefrontCount(address owner) constant public returns (uint) {
		uint initialCount = storefronts[owner].length;
		for(uint i=0; i<storefronts[owner].length; i++)
			if (storefronts[owner][i] == 0x0000000000000000000000000000000000000000000000000000000000000000)
				initialCount -= 1; 
		return initialCount;
	}

	function getStorefrontsId(address owner, uint storefrontIndex) constant public returns (bytes32) {
		return storefronts[owner][storefrontIndex];
	}

	function addProduct(bytes32 storefrontId, string name, string description, uint price, uint qty) 
	public onlyStorefrontOwner(storefrontId) returns (bytes32) {
		bytes32 productId = keccak256(msg.sender, storefrontId, name, description, price, qty); 
		Product memory p = Product(productId, name, description, price, qty, storefrontId); 
		inventories[storefrontId].push(p); 
		emit ProductCreated(productId, name, description, price, qty, storefrontId);
		return p.id; 
	}

	function updateProductPrice(bytes32 storefrontId, bytes32 productId, uint newPrice) onlyStorefrontOwner(storefrontId) public returns (uint) {
		Product [] inventory = inventories[storefrontId];
		uint p = 0;
		uint oldPrice = 0;

		for (uint i=0; i<inventory.length; i++) {
			if (inventory[i].id == productId) {
				oldPrice = inventory[i].price;
				inventory[i].price = newPrice;
				p = inventory[i].price;
				emit PriceUpdated(productId, oldPrice, newPrice);
				break;
			}
		}
		return p;
	}

	function getProductPrice(bytes32 storefrontId, bytes32 productId) constant public returns (uint) {
		Product [] inventory = inventories[storefrontId];
		for (uint i=0; i<inventory.length; i++) {
			if (inventory[i].id == productId) {
				return inventory[i].price;
			}
		}
		return 0;
	}

	function removeProduct(bytes32 storefrontId, bytes32 productId) onlyStorefrontOwner(storefrontId) public {
		Product [] inventory = inventories[storefrontId]; 
		uint productCount = inventory.length; 

		for(uint i=0; i<productCount; i++) {
			if (inventory[i].id == productId) {
				inventory[i] = inventory[productCount-1];
				delete inventory[productCount-1];
				emit ProductRemoved(productId, storefrontId);
				break;
			}
		}
	}

	function getProductCount(bytes32 storefrontId) constant public returns (uint) {
		uint count = inventories[storefrontId].length;
		for(uint i=0; i<count; i++) {
			if (inventories[storefrontId][i].id == 0x0000000000000000000000000000000000000000000000000000000000000000)
				count -= 1;
		}
		return count;
	}

	function getProductId(bytes32 storefrontId, uint productIndex) public returns (bytes32) {
		return bytes32(inventories[storefrontId][productIndex].id); 
	}

	function purchaseProduct(bytes32 storefrontId, bytes32 productId) payable returns (bool) {
		// Fetch product from inventory
		Product [] inventory = inventories[storefrontId]; 
		uint productCount = inventory.length; 
		Product product;
		uint index;

		for(uint i=0; i<productCount; i++) {
			if (inventory[i].id == productId) {
				product = inventory[i];
				index = i;
			} else if (i == (productCount-1)) {
				return false;
			}
		}

		// Check if amount sent is large enough. If too large, refund the difference
		require(msg.value >= product.price);
		uint refund = 0; 
		if (msg.value > product.price) {
			refund = msg.value - product.price;
			msg.sender.transfer(refund);
		}


		// Update product and storefront attributes
		product.qty -= 1;
		storefrontById[storefrontId].balance += product.price;
		emit ProductSold(productId, storefrontId, product.price, msg.sender);
		return true;
	}
}