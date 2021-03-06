pragma solidity 0.4.24;

import "../installed_contracts/zeppelin/contracts/ownership/Ownable.sol";
import "../installed_contracts/zeppelin/contracts/lifecycle/Destructible.sol";
import "../installed_contracts/zeppelin/contracts/lifecycle/Pausable.sol";

/*
* @title Marketplace 
*
* @dev This contract allows the addition and removal of admins and storefront owners 
* The Ownable, Destructible and Pausable contracts are all taken from Zeppelin
*/
contract Marketplace is Ownable, Destructible, Pausable {

	/** @dev Account that deploys contract is made admin.
	*/
	constructor() public {
		administrators[msg.sender] = true;
	}

	/** @dev the mappings store current administrators and storeowners
	* @dev The array stores address of to-be-approved storeowners. 
	* There is currently no way to clear/reset the requestedStoreOwners. 
	*/
	mapping (address => bool) private administrators; 
	mapping (address => bool) private storeOwners;
	address[] private requestedStoreOwners;

	// Events emmited by the contract 
	event AdminAdded (address adminAddress);
	event AdminRemoved (address removedAddress);
	event StoreOwnerRequest (address requester);
	event StoreOwnerAdded (address storeOwnerAddress);
	event StoreOwnerRemoved (address storeOwnerAddress);

	// @dev modifier to restrict function calls to administrators
	modifier onlyAdmin() {
		require(administrators[msg.sender] == true);
		_;
	}

	/** @dev Adds an administrator. Admins can add more administrators.
	* @param admin Address to add as administrator 
	*/ 
	function addAdmin(address admin) 
	onlyAdmin 
	whenNotPaused
	public {
		administrators[admin] = true;
		emit AdminAdded(admin);
	}

	/** @dev Removes an administrator. Only owners can remove administrators.
	* @param admin Address to remove as administrator 
	*/
	function removeAdmin(address admin) 
	onlyOwner
	whenNotPaused
	public {
		require(administrators[admin] == true);
		administrators[admin] = false;
		emit AdminRemoved(admin);
	}

	/** @dev Checks if address is an administrator. 
	* @param admin Address to remove as administrator 
	* @return True if address is admin. False otherwise. 
	*/ 
	function checkAdmin(address admin) 
	view 
	public 
	returns (bool) {
		return administrators[admin];
	}

	// @dev Adds msg.sender to requestedStoreOwners array
	function requestStoreOwnerStatus() 
	whenNotPaused
	public {
		require(storeOwners[msg.sender] == false);
		requestedStoreOwners.push(msg.sender);
		emit StoreOwnerRequest(msg.sender);
	}

	/** @dev Returns the length of the requestedStoreOwners array. 
	* Because there is no way to clear the array as of now, 
	* the length will include requesters who have already been approved.
	* 
	* @return Length of the requestedStoreOwners
	*/ 
	function getRequestedStoreOwnersLength() 
	view 
	public 
	returns (uint) {
		return requestedStoreOwners.length;
	}


	/** @dev Returns the address at position index in requestedStoreOwners
	* @param index Position in requestedStoreOwners
	* @return Address at position index in requestedStoreOwners
	*/ 
	function getRequestedStoreOwner(uint index) 
	view 
	public 
	returns (address) {
		return requestedStoreOwners[index];
	} 

	/** @dev Marks an address as a storeowner 
	* @param requester The address to add as a storeowner 
	*/ 
	function approveStoreOwnerStatus(address requester) 
	onlyAdmin 
	whenNotPaused
	public {
		storeOwners[requester] = true; 
		emit StoreOwnerAdded(requester);
	}

	/** @dev Removes an address its storeowner status
	* @param storeOwner The address to remove as a storeowner 
	*/ 	
	function removeStoreOwnerStatus(address storeOwner) 
	onlyAdmin 
	whenNotPaused
	public {
		storeOwners[storeOwner] = false; 
		emit StoreOwnerRemoved(storeOwner);
	}
 
	/** @dev Checks if an address has storeowner status
	* @param storeOwner for which to check the status 
	* @return True if the address is a storeowner. False otherwise.
	*/ 	
	function checkStoreOwnerStatus(address storeOwner) 
	view 
	public 
	returns (bool) {
		return storeOwners[storeOwner];
	}
}