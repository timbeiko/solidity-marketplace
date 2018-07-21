pragma solidity ^0.4.2;

import "./zeppelin/ownership/Ownable.sol";
import './zeppelin/lifecycle/Killable.sol';
import './Marketplace.sol';


/*
* Store 
*
* This is the main contract for the Store implementation.
*/
contract Store is Ownable, Killable {
	address public marketplaceId; 
	Marketplace public marketplaceInstance; 
	constructor(address marketplaceContract) public {
		marketplaceInstance = Marketplace(marketplaceContract);
		marketplaceId = marketplaceContract; 
	}

}