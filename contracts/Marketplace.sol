pragma solidity ^0.4.2;

/*
* Marketplace 
*
* This is the main contract for the Marketplace implementation.
*/
contract Marketplace {
	struct Item {
		string name;
		string description;
		uint price; 
	}

	struct Store {
		string name;
		uint balance;
		mapping (Item => uint) inventory;
		address storeOwner; // Not sure if this is necessary
	}

	address[] public administrators; 
	mapping (address => Store) private stores;

}