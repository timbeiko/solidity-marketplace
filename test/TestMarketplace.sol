pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Marketplace.sol";

contract TestMarketplace {
	address testAddress = 0x5aeda56215b167893e80b4fe645ba6d5bab767de;
	event print_address(address);

	function testOwnerIsMadeAdmin() {
		Marketplace marketplace = Marketplace(DeployedAddresses.Marketplace());
		Assert.equal(marketplace.checkAdmin(msg.sender), true, "It should make the owner of the contract an administrator");
	}

	function testOtherAccountIsNotMadeAdmin() {
		Marketplace marketplace = Marketplace(DeployedAddresses.Marketplace());
		Assert.equal(marketplace.checkAdmin(testAddress), false, "It should not make another address an administrator");
	}

	// This doesn't seem to work because you can't set the sender. 
	// function testAdminCanAddAdmin() {
	// 	Marketplace marketplace = Marketplace(DeployedAddresses.Marketplace());
	// 	marketplace.addAdmin(testAddress);
	// 	Assert.equal(marketplace.checkAdmin(testAddress), true, "testAddress should have been added as an admin");
	// }
}