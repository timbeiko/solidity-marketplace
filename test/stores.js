var Marketplace = artifacts.require("./Marketplace.sol");
var Stores = artifacts.require("./Stores.sol");

contract('Stores', async (accounts) => {
	it("Should allow store owners to create a storefront", async () => {
		let marketplace = await Marketplace.deployed();
		let stores = await Stores.deployed();

		let storeOwner = accounts[1];
		await marketplace.approveStoreOwnerStatus(storeOwner, {from: accounts[0]});
		await stores.createStorefront("Test store", {from: storeOwner});

		let storeCount = await stores.getStorefrontCountByOwner(storeOwner);

		assert.equal(storeCount, 1);
	});

	it("Should allow store owners to create a multiple storefronts", async () => {
		let marketplace = await Marketplace.new();
		let stores = await Stores.new(marketplace.address);

		let storeOwner = accounts[1];
		await marketplace.approveStoreOwnerStatus(storeOwner, {from: accounts[0]});
		await stores.createStorefront("Test store 1", {from: storeOwner});
		await stores.createStorefront("Test store 2", {from: storeOwner});
		await stores.createStorefront("Test store 3", {from: storeOwner});

		let storeCount = await stores.getStorefrontCountByOwner(storeOwner);

		assert.equal(storeCount, 3);
	});

	it("Should *not* allow non-store owners to create a storefront", async() => {
		let marketplace = await Marketplace.new();
		let stores = await Stores.new(marketplace.address);
		await stores.createStorefront("Test store 1", {from: accounts[2]});
		let storeCount = await stores.getStorefrontCountByOwner(accounts[2]);
		assert.equal(storeCount, 0);
	});

	it("Should allow storefront owners to remove a storefront", async() => {
		let marketplace = await Marketplace.new();
		let stores = await Stores.new(marketplace.address);

		let storeOwner = accounts[1];
		await marketplace.approveStoreOwnerStatus(storeOwner, {from: accounts[0]});
		await stores.createStorefront("Test store", {from: storeOwner});
		let storeCount = await stores.getStorefrontCountByOwner(storeOwner);
		assert.equal(storeCount, 1);

		let storeFrontId = await stores.getStorefrontsIdByOwnerAndIndex(storeOwner, 0); 
		await stores.removeStorefront(storeFrontId, {from: storeOwner}); 
		storeCount = await stores.getStorefrontCountByOwner(storeOwner);
		assert.equal(storeCount, 0);
	});

	it("Should allow *not* allow non-storefront owners to remove an owner's storefront", async() => {
		let marketplace = await Marketplace.new();
		let stores = await Stores.new(marketplace.address);

		let storeOwner = accounts[1];
		await marketplace.approveStoreOwnerStatus(storeOwner, {from: accounts[0]});
		await stores.createStorefront("Test store", {from: storeOwner});
		let storeCount = await stores.getStorefrontCountByOwner(storeOwner);
		assert.equal(storeCount, 1);

		let notOwner = accounts[2];
		let storeFrontId = await stores.getStorefrontsIdByOwnerAndIndex(storeOwner, 0); 
		await stores.removeStorefront(storeFrontId, {from: notOwner}); 
		storeCount = await stores.getStorefrontCountByOwner(storeOwner);
		assert.equal(storeCount, 1);
	});

	it("Should allow a storefront owner to add a product to their storefront", async() => {
		let marketplace = await Marketplace.new();
		let stores = await Stores.new(marketplace.address);

		let storeOwner = accounts[1];
		await marketplace.approveStoreOwnerStatus(storeOwner, {from: accounts[0]});
		await stores.createStorefront("Test store", {from: storeOwner});
		let storefrontId = await stores.getStorefrontsIdByOwnerAndIndex(storeOwner, 0); 
		await stores.addProductToStorefront(storefrontId, "Test Product", "A test product", 100000, 100, {from: storeOwner});
		let productCount = await stores.getProductCountByStorefrontId(storefrontId);
		assert.equal(productCount, 1);
	});

	it("Should allow a storefront owner to add several products to their storefront", async() => {
		let marketplace = await Marketplace.new();
		let stores = await Stores.new(marketplace.address);

		let storeOwner = accounts[1];
		await marketplace.approveStoreOwnerStatus(storeOwner, {from: accounts[0]});
		await stores.createStorefront("Test store", {from: storeOwner});
		let storefrontId = await stores.getStorefrontsIdByOwnerAndIndex(storeOwner, 0); 
		await stores.addProductToStorefront(storefrontId, "Test Product 1", "A test product", 100000, 100, {from: storeOwner});
		await stores.addProductToStorefront(storefrontId, "Test Product 2", "A test product", 100000, 100, {from: storeOwner});
		await stores.addProductToStorefront(storefrontId, "Test Product 3", "A test product", 100000, 100, {from: storeOwner});

		let productCount = await stores.getProductCountByStorefrontId(storefrontId);
		assert.equal(productCount, 3);
	});

	it("Should allow a storefront owner to update the price of a product from their storefront", async() => {
		let marketplace = await Marketplace.new();
		let stores = await Stores.new(marketplace.address);

		// Adding a product 
		let storeOwner = accounts[1];
		await marketplace.approveStoreOwnerStatus(storeOwner, {from: accounts[0]});
		await stores.createStorefront("Test store", {from: storeOwner});
		let storefrontId = await stores.getStorefrontsIdByOwnerAndIndex(storeOwner, 0); 
		let productId = await stores.addProductToStorefront(storefrontId, "Test Product", "A test product", 100000, 100, {from: storeOwner});
		let productCount = await stores.getProductCountByStorefrontId(storefrontId);

		// Updating price 
		let newPrice = await stores.updateProductPrice(storefrontId, productId, 1234); 
		assert.equal(newPrice, 1234);
	});


	it("Should allow a storefront owner to remove a product from their storefront", async() => {
		let marketplace = await Marketplace.new();
		let stores = await Stores.new(marketplace.address);

		// Adding a product 
		let storeOwner = accounts[1];
		await marketplace.approveStoreOwnerStatus(storeOwner, {from: accounts[0]});
		await stores.createStorefront("Test store", {from: storeOwner});
		let storefrontId = await stores.getStorefrontsIdByOwnerAndIndex(storeOwner, 0); 
		let productId = await stores.addProductToStorefront(storefrontId, "Test Product", "A test product", 100000, 100, {from: storeOwner});
		let productCount = await stores.getProductCountByStorefrontId(storefrontId);
		assert.equal(productCount, 1);


		// Removing a product 
		await stores.removeProductFromStorefront(storefrontId, productId, {from: storeOwner}); 
		productCount = await stores.getProductCountByStorefrontId(storefrontId);
		assert.equal(productCount, 0);
	});
});
