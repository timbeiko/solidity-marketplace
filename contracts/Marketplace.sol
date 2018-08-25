pragma solidity ^0.4.2;

import "../installed_contracts/zeppelin/contracts/ownership/Ownable.sol";
import "../installed_contracts/zeppelin/contracts/lifecycle/Destructible.sol";
import "../installed_contracts/zeppelin/contracts/lifecycle/Pausable.sol";

/*
* Marketplace 
*
* This is the main contract for the Marketplace implementation.
*/
contract Marketplace is Ownable, Destructible, Pausable {
	constructor() public {
		administrators[msg.sender] = true;
	}

	mapping (address => bool) public administrators; 
	address[] requestedStoreOwners;
	mapping (address => bool) public storeOwners;

	event AdminAdded (address adminAddress);
	event AdminRemoved (address removedAddress);
	event StoreOwnerRequest (address requester);
	event StoreOwnerAdded (address storeOwnerAddress);
	event StoreOwnerRemoved (address storeOwnerAddress);

	modifier onlyAdmin() {
		if (administrators[msg.sender] == true)
			_;
	}

	// This function should maybe be set to onlyOwner as well... 
	function addAdmin(address admin) 
	onlyAdmin 
	whenNotPaused
	public {
		administrators[admin] = true;
		emit AdminAdded(admin);
	}

	// There should maybe be an "owner UI", but perhaps that's overkill...
	function removeAdmin(address admin) 
	onlyOwner
	whenNotPaused
	public {
		if (administrators[admin] == true)
			administrators[admin] = false;
			emit AdminRemoved(admin);
	}

	function checkAdmin(address admin) 
	constant 
	public 
	returns (bool) {
		return administrators[admin];
	}

	function requestStoreOwnerStatus() 
	whenNotPaused
	public {
		if (storeOwners[msg.sender] == false)
			requestedStoreOwners.push(msg.sender);
			emit StoreOwnerRequest(msg.sender);
	}

	function getRequestedStoreOwnersLength() 
	constant 
	public 
	returns (uint) {
		return requestedStoreOwners.length;
	}

	function getRequestedStoreOwner(uint id) 
	constant 
	public 
	returns (address) {
		return requestedStoreOwners[id];
	} 

	function approveStoreOwnerStatus(address requester) 
	onlyAdmin 
	whenNotPaused
	public {
		storeOwners[requester] = true; 
		emit StoreOwnerAdded(requester);
	}

	function removeStoreOwnerStatus(address storeOwner) 
	onlyAdmin 
	whenNotPaused
	public {
		storeOwners[storeOwner] = false; 
		emit StoreOwnerRemoved(storeOwner);
	}
 
	function checkStoreOwnerStatus(address storeOwner) 
	constant 
	public 
	returns (bool) {
		return storeOwners[storeOwner];
	}
}