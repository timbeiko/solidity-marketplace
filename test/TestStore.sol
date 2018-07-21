pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Marketplace.sol";
import "../contracts/Store.sol";

contract TestStore {
	function testMarketplaceIdIsSet() public {
		Store store = Store(DeployedAddresses.Store());
		Assert.equal(address(store.marketplaceId()), address(DeployedAddresses.Marketplace()), "Should be the address of deployed Marketplace Contract");
	}
}
