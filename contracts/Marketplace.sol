pragma solidity ^0.4.2;

import "./zeppelin/ownership/Ownable.sol";
import './zeppelin/lifecycle/Killable.sol';

/*
* Marketplace 
*
* This is the main contract for the Marketplace implementation.
*/
contract Marketplace is Ownable, Killable {
	enum StoreStatus {PendingAdminApproval, Live}

	struct Product {
		string name;
		string description;
		uint price; 
		uint quantity;
	}

	struct Store {
		uint id; 
		string name;
		uint balance;
		address owner; 
		StoreStatus status;
	}

	mapping (address => bool) public administrators; 
	address[] requestedStoreOwners;
	mapping (address => bool) public storeOwners;
	mapping (address => Store []) public stores;
	mapping (uint => Product []) public inventories;

	modifier onlyAdmin() {
		if (administrators[msg.sender] == true)
			_;
	}

	modifier onlyStoreOwner() {
		if (storeOwners[msg.sender] == true)
			_;
	}

	constructor() public {
		administrators[msg.sender] = true;
	}

	function addAdmin(address admin) onlyAdmin public {
		administrators[admin] = true;
	}

	function removeAdmin(address admin) onlyOwner public {
		if (administrators[admin] == true)
			administrators[admin] = false;
	}

	function checkAdmin(address admin) constant public returns (bool) {
		return administrators[admin];
	}

	function requestStoreOwnerStatus() public {
		if (storeOwners[msg.sender] == false)
			requestedStoreOwners.push(msg.sender);
	}

	function getRequestedStoreOwnersLength() constant public returns (uint) {
		return requestedStoreOwners.length;
	}

	function getRequestedStoreOwner(uint id) constant public returns (address) {
		return requestedStoreOwners[id];
	} 

	function approveStoreOwnerStatus(address requester) onlyAdmin public {
		storeOwners[requester] = true; 
	}

	function checkStoreOwnerStatus(address storeOwner) constant public returns (bool) {
		return storeOwners[storeOwner];
	}

}