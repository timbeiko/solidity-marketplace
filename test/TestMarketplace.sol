pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Marketplace.sol";

contract TestMarketplace {
	address testAddress = 0x5AEDA56215b167893e80B4fE645BA6d5Bab767DE;
	event print_address(address);

	function testOwnerIsMadeAdmin() public {
		Marketplace marketplace = Marketplace(DeployedAddresses.Marketplace());
		Assert.equal(marketplace.checkAdmin(msg.sender), true, "It should make the owner of the contract an administrator");
	}

	function testOtherAccountIsNotMadeAdmin() public {
		Marketplace marketplace = Marketplace(DeployedAddresses.Marketplace());
		Assert.equal(marketplace.checkAdmin(testAddress), false, "It should not make another address an administrator");
	}

	function testCanRequestStoreOwnerStatus() public {
		Marketplace marketplace = Marketplace(DeployedAddresses.Marketplace());
		marketplace.requestStoreOwnerStatus();
		Assert.equal(marketplace.getRequestedStoreOwnersLength(), 1, "There should be one requested store ownership");
	}
}