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
		uint id; 
		string name;
		address owner; 
		uint balance; 
	}

	struct Product {
		uint id; 
		string name; 
		string description; 
		uint cost; 
		uint qty; 
		uint storeId; 
	}

	mapping (address => Storefront[]) storefronts; 
	mapping (uint => Product []) inventories; 

	modifier onlyStoreOwner() {
		if (marketplaceInstance.checkStoreOwnerStatus(msg.sender) == true)
			_;
	}

	function createStorefront(string name) onlyStoreOwner public {
		
	}

}