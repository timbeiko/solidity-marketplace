pragma solidity ^0.4.2;

import "./zeppelin/ownership/Ownable.sol";
import './zeppelin/lifecycle/Killable.sol';

/*
* Marketplace 
*
* This is the main contract for the Marketplace implementation.
*/
contract Marketplace is Ownable, Killable {
	struct Item {
		string name;
		string description;
		uint price; 
		uint quantity;
	}

	struct Store {
		string name;
		uint balance;
		Item[] inventory;
		address storeOwner; // Not sure if this is necessary
	}

	mapping (address => bool) public administrators; 
	mapping (address => Store) public stores;

	modifier onlyAdmin() {
		if (administrators[msg.sender] == true)
			_;
	}

	constructor() public {
		administrators[msg.sender] = true;
	}

	function addAdmin(address admin) onlyAdmin {
		administrators[admin] = true;
	}

	function removeAdmin(address admin) onlyOwner {
		if (administrators[admin] == true)
			administrators[admin] = false;
	}

	function checkAdmin(address admin) constant returns (bool) {
		return administrators[admin];
	}

}