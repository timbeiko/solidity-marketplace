pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Marketplace.sol";
import "../contracts/Stores.sol";

contract TestStores {
	function testMarketplaceIdIsSet() public {
		Stores stores = Stores(DeployedAddresses.Stores());
		Assert.equal(address(stores.marketplaceId()), address(DeployedAddresses.Marketplace()), "Should be the address of deployed Marketplace Contract");
	}
}
