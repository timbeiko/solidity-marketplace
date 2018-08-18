pragma solidity ^0.4.2;

import "./zeppelin/ownership/Ownable.sol";
import './zeppelin/lifecycle/Killable.sol';

/*
* Marketplace 
*
* This is the main contract for the Marketplace implementation.
*/
contract Marketplace is Ownable, Killable {
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

	function addAdmin(address admin) onlyAdmin public {
		administrators[admin] = true;
		emit AdminAdded(admin);
	}

	function removeAdmin(address admin) onlyOwner public {
		if (administrators[admin] == true)
			administrators[admin] = false;
			emit AdminRemoved(admin);
	}

	function checkAdmin(address admin) constant public returns (bool) {
		return administrators[admin];
	}

	function requestStoreOwnerStatus() public {
		if (storeOwners[msg.sender] == false)
			requestedStoreOwners.push(msg.sender);
			emit StoreOwnerRequest(msg.sender);
	}

	function getRequestedStoreOwnersLength() constant public returns (uint) {
		return requestedStoreOwners.length;
	}

	function getRequestedStoreOwner(uint id) constant public returns (address) {
		return requestedStoreOwners[id];
	} 

	function approveStoreOwnerStatus(address requester) onlyAdmin public {
		storeOwners[requester] = true; 
		emit StoreOwnerAdded(requester);
	}

	function removeStoreOwnerStatus(address storeOwner) onlyAdmin public {
		storeOwners[storeOwner] = false; 
		emit StoreOwnerRemoved(storeOwner);
	}
 
	function checkStoreOwnerStatus(address storeOwner) constant public returns (bool) {
		return storeOwners[storeOwner];
	}

	// Need to update this --- not working for a bunch of reasons:
	// 1. Validate if after setting things to 0x0, it will still push store owners to that spot 
	// 2. Make sure to track the count better (i.e. subtract if requester[i] == 0x0), like in Stores.sol
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