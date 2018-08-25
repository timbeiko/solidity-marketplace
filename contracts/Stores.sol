pragma solidity ^0.4.2;

import "../installed_contracts/zeppelin/contracts/ownership/Ownable.sol";
import "../installed_contracts/zeppelin/contracts/lifecycle/Destructible.sol";
import "../installed_contracts/zeppelin/contracts/lifecycle/Pausable.sol";
import './Marketplace.sol';

/*
* @title Store 
*
* @dev This contract allows storeowners to manage their storefront and purchasers to buy products.
* The Ownable, Destructible and Pausable contracts are all taken from Zeppelin.
*/
contract Stores is Ownable, Destructible, Pausable {
	address public marketplaceId; 
	Marketplace public marketplaceInstance; 

	/** @dev Constructor. Links with Marketplace contract
	* @param marketplaceContract Address of Marketplace contract to link
	*/
	constructor(address marketplaceContract) public {
		marketplaceInstance = Marketplace(marketplaceContract);
		marketplaceId = marketplaceContract; 
	}

	/** @dev Struct that stores Storeront data 
	* @param id Storefront id 
	* @param name Storefront name 
	* @param owner Address of owner of storefront 
	* @param balance Storefront balance 
	*/
	struct Storefront {
		bytes32 id; 
		string name;
		address owner; 
		uint balance; 
	}

	/** @dev Struct that stores Product data 
	* @param id Product id 
	* @param name Product name 
	* @param description Product description
	* @param price Product price 
	* @param qty Product quantity  
	* @param storefrontId Id of storefront in which product belongs 
	*/	
	struct Product {
		bytes32 id; 
		string name; 
		string description; 
		uint price; 
		uint qty; 
		bytes32 storefrontId; 
	}

	// Events emmited by the contract 
	event StorefrontCreated (
		bytes32 id, 
		string name, 
		address owner, 
		uint totalStores);

	event StorefrontRemoved (bytes32 id);

	event BalanceWithdrawn (
		bytes32 storefrontId,
		uint256 amount);

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


	// List of all storefronts 
	bytes32[] public storefronts;
	// Mapping between storefront owners and the IDs of their storefronts 
	mapping (address => bytes32[]) public storefrontsByOwner; 
	// Mapping between storefront IDs and their struct 
	mapping (bytes32 => Storefront) public storefrontById;
	// Mapping between storefronts  and the IDs of their products 
	mapping (bytes32 => bytes32[]) public inventories; 
	// Mapping between product IDs and their struct 
	mapping (bytes32 => Product) public productById;

	// @dev Checks if msg.sender is has storeowner status
	modifier onlyStoreOwner() {
		if (marketplaceInstance.checkStoreOwnerStatus(msg.sender) == true)
			_;
	}

	/** @dev Checks if msg.sender is the owner of a specific storefront 
	* @param id Storefront id for which to check if msg.sender is the owner
	*/
	modifier onlyStorefrontOwner(bytes32 id) {
		if (storefrontById[id].owner == msg.sender)
			_; 
	}

	/** @dev Returns the entire balance held by the contract. 
	* @returns Balance held by the contract
	*/
	function getBalance() 
	constant
	public 
	returns (uint) {
		return address(this).balance;
	}

	/** @dev Returns the number of storefronts (including deleted ones)
	* @returns The number of storefronts that were created. 
	*/
	function getTotalStorefrontsCount() 
	constant 
	public 
	returns (uint) {
		return storefronts.length;
	}

	/** @dev Creates a new storefront. 
	* Uses msg.sender, the storefront name and `now` to generate storefront id. 
	* @param name Storefront name 
	* @returns s.id Storefront id 
	*/ 
	function createStorefront(string name) 
	onlyStoreOwner 
	whenNotPaused
	public 
	returns (bytes32) {
		bytes32 id = keccak256(abi.encodePacked(msg.sender, name, now));
		Storefront memory s = Storefront(id, name, msg.sender, 0);
		storefrontsByOwner[msg.sender].push(s.id);
		storefrontById[id] = s;
		storefronts.push(s.id);
		emit StorefrontCreated(id, name, msg.sender, getStorefrontCount(msg.sender));
		return s.id; 
	}

	/** @dev Removes a storefront.
	* First removes all its products, 
	* then removes it from mapping and arrays and 
	* finally, sends balance to owner.
	* @param id Storefront id to remove 
	*/ 
	function removeStorefront(bytes32 id) 
	onlyStorefrontOwner(id) 
	whenNotPaused
	public {
		Storefront memory sf = storefrontById[id]; 
		bytes32 [] storage inventory = inventories[id]; 

		// Delete all products from storefront 
		for (uint i=0; i<inventory.length; i++) {
			delete productById[inventory[i]];
			delete inventory[i];
		}

		// Remove from storefrontsByOwner mapping
		uint sfCount = storefrontsByOwner[msg.sender].length; 
		for(i=0; i<sfCount; i++) {
			if (storefrontsByOwner[msg.sender][i] == id) {
				storefrontsByOwner[msg.sender][i] = storefrontsByOwner[msg.sender][sfCount-1]; 
				delete storefrontsByOwner[msg.sender][sfCount-1];
				break;
			}
		}

		// Remove from storefronts array 
		sfCount = storefronts.length;
		for(i=0; i<sfCount; i++) {
			if (storefronts[i] == id) {
				delete storefronts[i];
				break;
			}
		}

		// Withdraw Balance 
		uint storefrontBalance = storefrontById[id].balance;
		if (storefrontBalance > 0) {
			msg.sender.transfer(storefrontBalance);
			storefrontById[id].balance = 0;
			emit BalanceWithdrawn(id, storefrontBalance);
		}

		// Remove from storefrontById 
		delete storefrontById[id];
		emit StorefrontRemoved(id);
	}

	/** @dev Transfers the balance of a storefront to its owner
	* @param storefrontId ID of storefront from which to withdraw balance 
	*/
	function withdrawStorefrontBalance(bytes32 storefrontId) 
	onlyStorefrontOwner(storefrontId)
	whenNotPaused
	public {
		uint storefrontBalance = storefrontById[storefrontId].balance;
		if (storefrontBalance > 0) {
			msg.sender.transfer(storefrontBalance);
			emit BalanceWithdrawn(storefrontId, storefrontBalance);
			storefrontById[storefrontId].balance = 0;
		}
	}

	/** @dev Returns the number of storefronts (including removed ones) associated to a specific owner. 
	* @param owner Address for which to return the number of owned storefronts 
	* @returns The number of storefronts associated to this address (including removed ones) 
	*/ 
	function getStorefrontCount(address owner) 
	constant 
	public 
	returns (uint) {
		return storefrontsByOwner[owner].length;
	}

	/** @dev Returns the ID of a storefront at a specific index 
	* @param storefrontIndex Index in storefronts for which to return the ID
	* @returns storefrontId ID of storefront at specified index 
	*/
	function getStorefrontId(uint storefrontIndex) 
	constant 
	public
	returns (bytes32) {
		return storefronts[storefrontIndex];
	}

	/** @dev Returns the address of a storefront's owner 
	* @param storefrontId ID for which to return the owner 
	* @returns address Address of the owner of the storefront  
	*/
	function getStorefrontOwner(bytes32 storefrontId) 
	constant 
	public 
	returns (address) {
		return storefrontById[storefrontId].owner;
	}

	/** @dev Returns the ID of an owner's storefront at a specific index 
	* @param owner Address ofthe storefront owner 
	* @param storefrontIndex Index in owner's storefronts for which to return the ID
	* @returns storefrontId ID of storefront at specified index in owner's storefronts
	*/
	function getStorefrontsId(address owner, uint storefrontIndex) 
	constant 
	public 
	returns (bytes32) {
		return storefrontsByOwner[owner][storefrontIndex];
	}

	/** @dev Returns the name of a storefront
	* @param storefrontId ID for which to return the name 
	* @returns Name of the storefront 
	*/
	function getStorefrontName(bytes32 storefrontId) 
	constant 
	public 
	returns (string) {
		return storefrontById[storefrontId].name;
	}

	/** @dev Returns the balance of a storefront
	* @param storefrontId ID for which to return the name 
	* @returns Storefront's balance 
	*/
	function getStorefrontBalance(bytes32 storefrontId) 
	constant 
	public 
	returns (uint) {
		return storefrontById[storefrontId].balance;
	}

	/** @dev Adds a product to a storefront
	* @param storefrontId ID of storefront to add the product to 
	* @param name Name of Product 
	* @param description Description of Product 
	* @param price Price of Product 
	* @param qty Quantity of Product 
	* @returns id ID of Product 
	*/
	function addProduct(bytes32 storefrontId, string name, string description, uint price, uint qty) 
	public 
	onlyStorefrontOwner(storefrontId) 
	whenNotPaused
	returns (bytes32) {
		bytes32 productId = keccak256(abi.encodePacked(msg.sender, storefrontId, name, description, price, qty)); 
		Product memory p = Product(productId, name, description, price, qty, storefrontId); 
		inventories[storefrontId].push(productId); 
		productById[productId] = p;
		emit ProductCreated(productId, name, description, price, qty, storefrontId);
		return p.id; 
	}

	/** @dev Updates the price of a product 
	* @param storefrontId ID of storefront associated with product
	* @param productId ID of product for which to update price 
	* @param newPrice new price to set to product 
	*/ 
	function updateProductPrice(bytes32 storefrontId, bytes32 productId, uint newPrice) 
	onlyStorefrontOwner(storefrontId) 
	whenNotPaused
	public {
		Product product = productById[productId];
		uint oldPrice = product.price;
		productById[productId].price = newPrice;
		emit PriceUpdated(productId, oldPrice, newPrice);
	}

	/** @dev Returns the price of a product
	* @param productId ID for which to return the price 
	* @returns Price of the product 
	*/
	function getProductPrice(bytes32 productId) 
	constant 
	public 
	returns (uint) {
		return productById[productId].price;
	}

	/** @dev Returns the name of a product
	* @param productId ID for which to return the name 
	* @returns Name of the product 
	*/
	function getProductName(bytes32 productId) 
	constant 
	public 
	returns (string) {
		return productById[productId].name;
	}

	/** @dev Returns all information about a product 
	* @param productId ID of product for which to return information 
	* @returns name Name of Product 
	* @returns desc Description of Product 
	* @returns price Price of Product 
	* @returns qty Quantity of Product 
	* @returns storefrontId ID of storefront associated with Product 
	*/
	function getProduct(bytes32 productId)
	constant 
	public
	returns (string, string, uint, uint, bytes32) {
		return (productById[productId].name,
				productById[productId].description,
				productById[productId].price,
				productById[productId].qty,
				productById[productId].storefrontId);
	}

	/** @dev Removes a product.
	* @param storefrontId Storefront ID for product to remove 
	* @param productId ID of product to remove 
	*/ 
	function removeProduct(bytes32 storefrontId, bytes32 productId) 
	onlyStorefrontOwner(storefrontId) 
	whenNotPaused
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

	/** @dev Returns the number of products (including removed ones) associated to a specific storefront. 
	* @param storefrontId Storefront ID for which to return the number of products 
	* @returns The number of products associated to this storefront (including removed ones) 
	*/ 
	function getProductCount(bytes32 storefrontId) 
	constant 
	public 
	returns (uint) {
		return inventories[storefrontId].length;
	}

	/** @dev Returns the ID of an storefront's product at a specific index 
	* @param storefrontId ID of the storefront from which to return a product 
	* @param productIndex Index in storefront's products for which to return the ID
	* @returns productId ID of product at specified index in storefront's products
	*/
	function getProductId(bytes32 storefrontId, uint productIndex) 
	constant
	public 
	returns (bytes32) {
		return bytes32(inventories[storefrontId][productIndex]); 
	}

	/** @dev Handles the purchase of a product 
	* @param storefrontId ID of storefront from which to purchase product 
	* @param productId ID of product to purchase 
	* @param qty Quantity of product to purchase 
	* @returns True if purchase was executed successfully. 
	*/ 
	function purchaseProduct(bytes32 storefrontId, bytes32 productId, uint qty) 
	payable 
	whenNotPaused
	returns (bool) {
		// Fetch product from inventory and perform checks 
		Product product = productById[productId];
		uint total =  product.price*qty;
		require(msg.value >= total);
		require(qty <= product.qty);

		// If amount sent is too large, refund the difference
		if (msg.value > total) {
			uint refund = msg.value - total;
			msg.sender.transfer(refund);
		}

		// Update product and storefront attributes
		product.qty -= qty;
		storefrontById[storefrontId].balance += product.price*qty;
		emit ProductSold(productId, storefrontId, product.price, qty, total, msg.sender, product.qty);
		return true;
	}
}