var Ownable = artifacts.require("./zeppelin/ownership/Ownable.sol");
var Destructible = artifacts.require("./zeppelin/lifecycle/Destructible.sol");
var Marketplace = artifacts.require("./Marketplace.sol");
var Stores = artifacts.require("./Stores.sol");

module.exports = function(deployer) {
  deployer.deploy(Ownable);
  deployer.link(Ownable, Destructible);
  deployer.deploy(Destructible);
  deployer.deploy(Marketplace).then(function() {
  	return deployer.deploy(Stores, Marketplace.address);
  });
  deployer.link(Marketplace, Ownable);
  deployer.link(Marketplace, Destructible);
};
