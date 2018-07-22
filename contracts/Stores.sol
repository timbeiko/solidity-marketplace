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
		bytes32 storeId; 
	}

	event StoreCreated (
		bytes32 id, 
		string name, 
		address owner, 
		uint totalStores);

	mapping (address => Storefront[]) public storefronts; 
	mapping (bytes32 => Product []) public inventories; 

	modifier onlyStoreOwner() {
		if (marketplaceInstance.checkStoreOwnerStatus(msg.sender) == true)
			_;
	}

	modifier onlyStorefrontOwner(Storefront s) {
		if (s.owner == msg.sender)
			_; 
	}

	function createStorefront(string name) onlyStoreOwner public {
		bytes32 id = keccak256(msg.sender, name, now);
		Storefront memory s = Storefront(id, name, msg.sender, 0);
		storefronts[msg.sender].push(s);
		emit StoreCreated(id, name, msg.sender, getStorefrontCountByOwner(msg.sender));
	}

	function getStorefrontCountByOwner(address owner) constant public returns (uint) {
		return storefronts[owner].length;
	}
}