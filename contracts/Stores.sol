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
		uint cost; 
		uint qty; 
		bytes32 storefrontId; 
	}

	event StoreCreated (
		bytes32 id, 
		string name, 
		address owner, 
		uint totalStores);

	event ProductCreated (
		bytes32 id, 
		string name, 
		string description, 
		uint cost, 
		uint qty, 
		bytes32 storefrontId);

	mapping (address => Storefront[]) public storefronts; 
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
		storefronts[msg.sender].push(s);
		storefrontById[id] = s;
		emit StoreCreated(id, name, msg.sender, getStorefrontCountByOwner(msg.sender));
		return s.id; 
	}

	function getStorefrontCountByOwner(address owner) constant public returns (uint) {
		return storefronts[owner].length;
	}

	function getStorefrontsIdByOwnerAndIndex(address owner, uint storefrontIndex) constant public returns (bytes32) {
		return storefronts[owner][storefrontIndex].id;
	}

	function addProductToStorefront(bytes32 storefrontId, string name, string description, uint cost, uint qty) 
	public onlyStorefrontOwner(storefrontId) returns (bytes32) {
		bytes32 productId = keccak256(msg.sender, storefrontId, name, now); 
		Product memory p = Product(productId, name, description, cost, qty, storefrontId); 
		inventories[storefrontId].push(p); 
		emit ProductCreated(productId, name, description, cost, qty, storefrontId);
		return p.id; 
	}

	function getProductCountByStorefrontId(bytes32 id) constant public returns (uint) {
		return inventories[id].length;
	}
}