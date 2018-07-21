var Ownable = artifacts.require("./zeppelin/ownership/Ownable.sol");
var Killable = artifacts.require("./zeppelin/lifecycle/Killable.sol");
var Authentication = artifacts.require("./Authentication.sol");
var Marketplace = artifacts.require("./Marketplace.sol");
var Store = artifacts.require("./Store.sol");

module.exports = function(deployer) {
  deployer.deploy(Ownable);
  deployer.link(Ownable, Killable);
  deployer.deploy(Killable);
  deployer.link(Killable, Authentication);
  deployer.deploy(Authentication);
  deployer.deploy(Marketplace).then(function() {
  	return deployer.deploy(Store, Marketplace.address);
  });
  deployer.link(Marketplace, Ownable);
  deployer.link(Marketplace, Killable);
};
