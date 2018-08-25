var Marketplace = artifacts.require("./Marketplace.sol");
var Pausable = artifacts.require("./Pausable.sol");


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
  		assert(marketplaceInstance.checkAdmin(accounts[1]), true);
  	}).then(function() {
  		return marketplaceInstance.removeAdmin(accounts[1], {from: owner});
  	}).then(function() {
  		assert(marketplaceInstance.checkAdmin(accounts[1]), false);
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
      admin = accounts[0]; 
      marketplaceInstance.approveStoreOwnerStatus(accounts[1], {from: admin});
      assert(marketplaceInstance.checkStoreOwnerStatus(accounts[1]), true);
    });
  });

  it("Should *not* allow non-admins to approve store owners", async () => {
    let marketplaceInstance = await Marketplace.deployed();
    try {
      await marketplaceInstance.approveStoreOwnerStatus(accounts[1], {from: accounts[2]}); 
      assert.fail('Should have reverted before');
    } catch(error) {
      assert.equal(error.message, "VM Exception while processing transaction: revert");
    }
  });

  it("Should allow admins to remove store owners", function() {
    return Marketplace.deployed().then(function(instance) {
      marketplaceInstance = instance;
      admin = accounts[0]; 
      marketplaceInstance.approveStoreOwnerStatus(accounts[1], {from: admin});
      marketplaceInstance.removeStoreOwnerStatus(accounts[1], {from: admin});
      assert(marketplaceInstance.checkStoreOwnerStatus(accounts[1]), false);
    });
  });

  it("Should *not* allow non-admins to remove store owners", async () => {
    let marketplaceInstance = await Marketplace.deployed();
    admin = accounts[0]; 
    nonAdmin = accounts[2];
    await marketplaceInstance.approveStoreOwnerStatus(accounts[1], {from: admin});
    try {
      await marketplaceInstance.removeStoreOwnerStatus(accounts[1], {from: nonAdmin});
      assert.fail('Should have reverted before');
    } catch(error) {
      assert.equal(error.message, "VM Exception while processing transaction: revert");
    }
  });

  it("Should allow owners to pause the contract", async () => {
    let MarketplaceInstance = await Marketplace.new();
    await MarketplaceInstance.pause({from: accounts[0]})
    let PausableInstance = await Pausable.deployed();
    assert(PausableInstance.paused, true);
  }); 

  it("Should not allow calling whenNotPaused functions if contract is paused", async () => {
    let MarketplaceInstance = await Marketplace.new();
    await MarketplaceInstance.pause({from: accounts[0]})
      try {
        await MarketplaceInstance.addAdmin(accounts[1], {from: accounts[0]});
        assert.fail('Should have reverted before');
      } catch(error) {
        assert.equal(error.message, "VM Exception while processing transaction: revert");
      }
  });

  it("Should allow owners to unpause the contract", async () => {
    let MarketplaceInstance = await Marketplace.new();
    await MarketplaceInstance.pause({from: accounts[0]})
    await MarketplaceInstance.unpause({from: accounts[0]})
    await MarketplaceInstance.addAdmin(accounts[1], {from: accounts[0]});

    let PausableInstance = await Pausable.deployed();
    assert(PausableInstance.paused, false);

    assert(marketplaceInstance.checkAdmin(accounts[1]), true);
  });
});