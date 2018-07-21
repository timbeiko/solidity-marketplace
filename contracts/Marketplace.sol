pragma solidity ^0.4.2;

import "./zeppelin/ownership/Ownable.sol";
import './zeppelin/lifecycle/Killable.sol';

/*
* Marketplace 
*
* This is the main contract for the Marketplace implementation.
*/
contract Marketplace is Ownable, Killable {
	mapping (address => bool) public administrators; 
	address[] requestedStoreOwners;
	mapping (address => bool) public storeOwners;

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

	function removeStoreOwnerStatus(address storeOwner) onlyAdmin public {
		storeOwners[storeOwner] = false; 
	}
 
	function checkStoreOwnerStatus(address storeOwner) constant public returns (bool) {
		return storeOwners[storeOwner];
	}

	function removeStoreOwnersFromRequestList() onlyAdmin public {
		uint emptySpots = 0; 
		uint requestLength = requestedStoreOwners.length;
		for(uint i=0; i<requestLength; i++) {
			if (checkStoreOwnerStatus(requestedStoreOwners[i]))
				requestedStoreOwners[i] = requestedStoreOwners[requestLength-1-emptySpots];
				emptySpots += 1; 
		}

		for(i=0; i<emptySpots; i++) {
			delete requestedStoreOwners[requestLength-1-i];
		}
	}
}