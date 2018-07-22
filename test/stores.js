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

	it("Should *not* allow non-store owners to create multiple storefronts", async() => {
		let marketplace = await Marketplace.new();
		let stores = await Stores.new(marketplace.address);
		await stores.createStorefront("Test store 1", {from: accounts[2]});
		let storeCount = await stores.getStorefrontCountByOwner(accounts[2]);
		assert.equal(storeCount, 0);
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
	})
});
