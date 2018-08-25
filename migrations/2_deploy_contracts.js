var Ownable = artifacts.require("./zeppelin/ownership/Ownable.sol");
var Destructible = artifacts.require("./zeppelin/lifecycle/Destructible.sol");
var Pausable = artifacts.require("./zeppelin/lifecycle/Pausable.sol");
var Marketplace = artifacts.require("./Marketplace.sol");
var Stores = artifacts.require("./Stores.sol");

module.exports = function(deployer) {
  deployer.deploy(Ownable);
  deployer.link(Ownable, Destructible);
  deployer.link(Ownable, Pausable);

  deployer.deploy(Pausable);
  deployer.deploy(Destructible);
  deployer.deploy(Marketplace).then(function() {
  	return deployer.deploy(Stores, Marketplace.address);
  });

  deployer.link(Marketplace, Ownable);
  deployer.link(Marketplace, Destructible);
  deployer.link(Marketplace, Pausable);
  deployer.link(Stores, Ownable);
  deployer.link(Stores, Destructible);
  deployer.link(Stores, Pausable);
};
