var Marketplace = artifacts.require("./Marketplace.sol");

contract('Marketplace', function(accounts) {

  it("On deploy, add the owner of the contract to administrators", function() {
  	return Marketplace.deployed().then(function(instance) {
  		assert(instance.checkAdmin(accounts[0]), true);
  	});
  });

  it("On deploy, do *not* add another account than the owner of the contract to administrators", function() {
  	return Marketplace.deployed().then(function(instance) {
  		assert(instance.checkAdmin(accounts[1]), false);
  	});
  });

  it("Should let an admin account add an admin", function() {
  	return Marketplace.deployed().then(function(instance) {
  		marketplaceInstance = instance;
  		admin = accounts[0];
  		futureAdmin = accounts[1];
  		return marketplaceInstance.addAdmin(futureAdmin, {from: admin});
  	}).then(function() {
  		assert(marketplaceInstance.checkAdmin(futureAdmin), true);
  	});
  });

  it("Should not let a non-admin account add an admin", function() {
  	return Marketplace.deployed().then(function(instance) {
  		marketplaceInstance = instance;
  		nonAdmin = accounts[1];
  		return marketplaceInstance.addAdmin(nonAdmin, {from: nonAdmin});
  	}).then(function() {
  		assert(marketplaceInstance.checkAdmin(nonAdmin), false);
  	});
  });

   it("Should let an owner account remove an admin", function() {
  	return Marketplace.deployed().then(function(instance) {
  		marketplaceInstance = instance;
  		owner = accounts[0];
  		return marketplaceInstance.addAdmin(accounts[1], {from: owner});
  	}).then(function() {
  		// accounts[1] should be an admin
  		assert(marketplaceInstance.checkAdmin(accounts[1]), true);
  	}).then(function() {
  		// Remove accounts[1] as an admin
  		return marketplaceInstance.removeAdmin(accounts[1], {from: owner});
  	}).then(function() {
  		// accounts[1] should no longer be an admin
  		assert(marketplaceInstance.checkAdmin(accounts[1]), false);
  	});
  });

  it("Should *not* let a non-owner account remove an admin", function() {
  	return Marketplace.deployed().then(function(instance) {
  		marketplaceInstance = instance;
  		owner = accounts[0];
  		admin = accounts[1];
  		account = accounts[2]
  		return marketplaceInstance.addAdmin(admin, {from: owner});
  	}).then(function() {
  		return marketplaceInstance.removeAdmin(owner, {from: account});
  	}).then(function() {
  		return marketplaceInstance.removeAdmin(owner, {from: account})
  	}).then(function() {
  		// owner should still be an admin 
  		assert(marketplaceInstance.checkAdmin(owner), true);
  	});
  });

});