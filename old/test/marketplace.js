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
  		return marketplaceInstance.removeAdmin(owner, {from: account});
  	}).then(function() {
  		// owner should still be an admin 
  		assert(marketplaceInstance.checkAdmin(owner), true);
  	});
  });

  it("Should allow anyone to request to be a store owner", function() {
    return Marketplace.deployed().then(function(instance) {
      marketplaceInstance = instance; 
      requester = accounts[1]; 
      marketplaceInstance.requestStoreOwnerStatus({from: requester});
    }).then(function() {
      assert(marketplaceInstance.getRequestedStoreOwnersLength(), 1);
      assert(marketplaceInstance.getRequestedStoreOwner(0), requester);
    });
  });


  it("Should allow admins to approve store owners", function() {
    return Marketplace.deployed().then(function(instance) {
      marketplaceInstance = instance; 
      admin = accounts[0]; // made admin by deploying the contract 
      marketplaceInstance.approveStoreOwnerStatus(accounts[1], {from: admin});
      assert(marketplaceInstance.checkStoreOwnerStatus(accounts[1]), true);
    });
  });

  it("Should *not* allow non-admins to approve store owners", function() {
    return Marketplace.deployed().then(function(instance) {
      marketplaceInstance = instance; 
      marketplaceInstance.approveStoreOwnerStatus(accounts[1], {from: accounts[2]}); 
      assert(marketplaceInstance.checkStoreOwnerStatus(accounts[1]), false);
    });
  });

  it("Should allow admins to remove store owners", function() {
    return Marketplace.deployed().then(function(instance) {
      marketplaceInstance = instance;
      admin = accounts[0]; // made admin by deploying the contract 
      marketplaceInstance.approveStoreOwnerStatus(accounts[1], {from: admin});
      marketplaceInstance.removeStoreOwnerStatus(accounts[1], {from: admin});
      assert(marketplaceInstance.checkStoreOwnerStatus(accounts[1]), false);
    });
  });

  it("Should *not* allow non-admins to remove store owners", function() {
    return Marketplace.deployed().then(function(instance) {
      marketplaceInstance = instance;
      admin = accounts[0]; // made admin by deploying the contract 
      nonAdmin = accounts[2];
      marketplaceInstance.approveStoreOwnerStatus(accounts[1], {from: admin});
      marketplaceInstance.removeStoreOwnerStatus(accounts[1], {from: nonAdmin});
      assert(marketplaceInstance.checkStoreOwnerStatus(accounts[1]), true);
    });
  });

  it("removeStoreOwnersFromRequestList should remove approved store owners from the list ", function() {
    return Marketplace.deployed().then(function(instance) {
      marketplaceInstance = instance; 
      admin = accounts[0]; 
      marketplaceInstance.requestStoreOwnerStatus({from: accounts[1]});
    }).then(function() {
      marketplaceInstance.requestStoreOwnerStatus({from: accounts[2]});
    }).then(function() {
      marketplaceInstance.requestStoreOwnerStatus({from: accounts[3]});
    }).then(function() {
      marketplaceInstance.approveStoreOwnerStatus(accounts[2], {from: admin});
    }).then(function() {
      marketplaceInstance.removeStoreOwnersFromRequestList({from: admin});
    }).then(function() {
      assert(marketplaceInstance.getRequestedStoreOwnersLength(), 2);
      assert(marketplaceInstance.getRequestedStoreOwner(0), accounts[1]);
      assert(marketplaceInstance.getRequestedStoreOwner(1), accounts[3]);
    });
  });
});