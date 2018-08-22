var Marketplace = artifacts.require("./Marketplace.sol");
var Stores = artifacts.require("./Stores.sol");

const promisify = (inner) =>
  new Promise((resolve, reject) =>
    inner((err, res) => {
      if (err) { reject(err) }
      resolve(res);
    })
  );

const getBalance = (account, at) =>
  promisify(cb => web3.eth.getBalance(account, at, cb));

contract('Stores', async (accounts) => {
	it("Should allow store owners to create a storefront", async () => {
		let marketplace = await Marketplace.deployed();
		let stores = await Stores.deployed();

		let storeOwner = accounts[1];
		await marketplace.approveStoreOwnerStatus(storeOwner, {from: accounts[0]});
		await stores.createStorefront("Test store", {from: storeOwner});

		let storeCount = await stores.getStorefrontCount(storeOwner);

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

		let storeCount = await stores.getStorefrontCount(storeOwner);

		assert.equal(storeCount, 3);
	});

	it("Should *not* allow non-store owners to create a storefront", async() => {
		let marketplace = await Marketplace.new();
		let stores = await Stores.new(marketplace.address);
		await stores.createStorefront("Test store 1", {from: accounts[2]});
		let storeCount = await stores.getStorefrontCount(accounts[2]);
		assert.equal(storeCount, 0);
	});

	it("Should allow storefront owners to remove a storefront", async() => {
		let marketplace = await Marketplace.new();
		let stores = await Stores.new(marketplace.address);

		let storeOwner = accounts[1];
		await marketplace.approveStoreOwnerStatus(storeOwner, {from: accounts[0]});
		await stores.createStorefront("Test store", {from: storeOwner});
		let storeCount = await stores.getStorefrontCount(storeOwner);
		assert.equal(storeCount, 1);

		let storeFrontId = await stores.getStorefrontsId(storeOwner, 0); 
		await stores.removeStorefront(storeFrontId, {from: storeOwner}); 
		storeCount = await stores.getStorefrontCount(storeOwner);
		assert.equal(storeCount, 0);
	});

	it("Should allow *not* allow non-storefront owners to remove an owner's storefront", async() => {
		let marketplace = await Marketplace.new();
		let stores = await Stores.new(marketplace.address);

		let storeOwner = accounts[1];
		await marketplace.approveStoreOwnerStatus(storeOwner, {from: accounts[0]});
		await stores.createStorefront("Test store", {from: storeOwner});
		let storeCount = await stores.getStorefrontCount(storeOwner);
		assert.equal(storeCount, 1);

		let notOwner = accounts[2];
		let storeFrontId = await stores.getStorefrontsId(storeOwner, 0); 
		await stores.removeStorefront(storeFrontId, {from: notOwner}); 
		storeCount = await stores.getStorefrontCount(storeOwner);
		assert.equal(storeCount, 1);
	});

	it("Should allow a storefront owner to add a product to their storefront", async() => {
		let marketplace = await Marketplace.new();
		let stores = await Stores.new(marketplace.address);

		let storeOwner = accounts[1];
		await marketplace.approveStoreOwnerStatus(storeOwner, {from: accounts[0]});
		await stores.createStorefront("Test store", {from: storeOwner});
		let storefrontId = await stores.getStorefrontsId(storeOwner, 0); 
		await stores.addProduct(storefrontId, "Test Product", "A test product", 100000, 100, {from: storeOwner});
		let productCount = await stores.getProductCount(storefrontId);
		assert.equal(productCount, 1);
	});

	it("Should allow a storefront owner to add several products to their storefront", async() => {
		let marketplace = await Marketplace.new();
		let stores = await Stores.new(marketplace.address);

		let storeOwner = accounts[1];
		await marketplace.approveStoreOwnerStatus(storeOwner, {from: accounts[0]});
		await stores.createStorefront("Test store", {from: storeOwner});
		let storefrontId = await stores.getStorefrontsId(storeOwner, 0); 
		await stores.addProduct(storefrontId, "Test Product 1", "A test product", 100000, 100, {from: storeOwner});
		await stores.addProduct(storefrontId, "Test Product 2", "A test product", 100000, 100, {from: storeOwner});
		await stores.addProduct(storefrontId, "Test Product 3", "A test product", 100000, 100, {from: storeOwner});

		let productCount = await stores.getProductCount(storefrontId);
		assert.equal(productCount, 3);
	});

	it("getProduct should return all attributes from a product", async() => {
		let marketplace = await Marketplace.new();
		let stores = await Stores.new(marketplace.address);

		let storeOwner = accounts[1];
		await marketplace.approveStoreOwnerStatus(storeOwner, {from: accounts[0]});
		await stores.createStorefront("Test store", {from: storeOwner});
		let storefrontId = await stores.getStorefrontsId(storeOwner, 0); 
		await stores.addProduct(storefrontId, "Test Product 1", "A test product", 100000, 100, {from: storeOwner});
		let productId = await stores.addProduct.call(storefrontId, "Test Product 1", "A test product", 100000, 100, {from: storeOwner});
		let productInfo = await stores.getProduct(productId);

		// All info should match 
		assert.equal(productInfo[0], "Test Product 1");
		assert.equal(productInfo[1], "A test product");
		assert.equal(productInfo[2].toNumber(), 100000);
		assert.equal(productInfo[3].toNumber(), 100);
		assert.equal(productInfo[4], storefrontId);

	});

	it("Should allow a storefront owner to update the price of a product from their storefront", async() => {
		let marketplace = await Marketplace.new();
		let stores = await Stores.new(marketplace.address);

		// Creating storefront 
		let storeOwner = accounts[1];
		await marketplace.approveStoreOwnerStatus(storeOwner, {from: accounts[0]});
		await stores.createStorefront("Test store", {from: storeOwner});
		let storefrontId = await stores.getStorefrontsId.call(storeOwner, 0); 

		// Add product 
		await stores.addProduct(storefrontId, "Test Product", "A test product", 100000, 100, {from: storeOwner});
		let productId = await stores.addProduct.call(storefrontId, "Test Product", "A test product", 100000, 100, {from: storeOwner});
		let productCount = await stores.getProductCount.call(storefrontId);
		assert.equal(productCount.toNumber(), 1);

		// Updating price 
		await stores.updateProductPrice(storefrontId, productId, 1234, {from: storeOwner}); 
		let newPrice = await stores.getProductPrice(productId); 
		assert.equal(newPrice.toNumber(), 1234);
	});

	it("Should allow a storefront owner to remove a product from their storefront", async() => {
		let marketplace = await Marketplace.new();
		let stores = await Stores.new(marketplace.address);

		// Creating storefront 
		let storeOwner = accounts[1];
		await marketplace.approveStoreOwnerStatus(storeOwner, {from: accounts[0]});
		await stores.createStorefront("Test store", {from: storeOwner});
		let storefrontId = await stores.getStorefrontsId.call(storeOwner, 0); 

		// Add a product, get ID and product count 
		await stores.addProduct(storefrontId, "Test Product", "A test product", 100000, 100, {from: storeOwner});
		let productId = await stores.addProduct.call(storefrontId, "Test Product", "A test product", 100000, 100, {from: storeOwner});
		await stores.getProductCount(storefrontId);
		let productCount = await stores.getProductCount.call(storefrontId);
		assert.equal(productCount.toNumber(), 1);

		// Removing a product 
		await stores.removeProduct(storefrontId, productId, {from: storeOwner}); 
		await stores.getProductCount(storefrontId);
		productCount = await stores.getProductCount.call(storefrontId);
		assert.equal(productCount.toNumber(), 0);
	});

	it("Should allow someone to purchase a product if they pay >= its price", async() => {
		let marketplace = await Marketplace.new();
		let stores = await Stores.new(marketplace.address);
		let productPrice = web3.toWei(10);
		let buyer = accounts[5];
		let initialBalance = await getBalance(buyer);

		// Creating storefront 
		let storeOwner = accounts[1];
		await marketplace.approveStoreOwnerStatus(storeOwner, {from: accounts[0]});
		await stores.createStorefront("Test store", {from: storeOwner});
		let storefrontId = await stores.getStorefrontsId.call(storeOwner, 0); 

		// Add a product, get ID
		await stores.addProduct(storefrontId, "Test Product", "A test product", productPrice, 100, {from: storeOwner});
		let productId = await stores.addProduct.call(storefrontId, "Test Product", "A test product", productPrice, 100, {from: storeOwner});
		await stores.getProductCount(storefrontId);

		// Purchase the product 
		let receipt = await stores.purchaseProduct(storefrontId, productId, 1, {from: buyer, value: productPrice});
		let gasUsed = receipt.receipt.gasUsed;
		let tx = await web3.eth.getTransaction(receipt.tx);
		let gasPrice = tx.gasPrice;
		let gasCost = gasUsed * gasPrice;

		let balance = await stores.getStorefrontBalance(storefrontId);
		assert.equal(balance, productPrice);

		let contractBalance = await stores.getBalance();
		assert.equal(contractBalance, productPrice);

		let finalBalance = await getBalance(buyer);
		assert.equal(initialBalance.toNumber()-productPrice-gasCost, finalBalance.toNumber());
	});

	it("Should allow someone to purchase multiple products if they pay >= the total", async() => {
		let marketplace = await Marketplace.new();
		let stores = await Stores.new(marketplace.address);
		let productPrice = 100000;
		let buyer = accounts[5];

		// Creating storefront 
		let storeOwner = accounts[1];
		await marketplace.approveStoreOwnerStatus(storeOwner, {from: accounts[0]});
		await stores.createStorefront("Test store", {from: storeOwner});
		let storefrontId = await stores.getStorefrontsId.call(storeOwner, 0); 

		// Add a product, get ID
		await stores.addProduct(storefrontId, "Test Product", "A test product", productPrice, 100, {from: storeOwner});
		let productId = await stores.addProduct.call(storefrontId, "Test Product", "A test product", productPrice, 100, {from: storeOwner});
		await stores.getProductCount(storefrontId);

		// Purchase the product 
		await stores.purchaseProduct(storefrontId, productId, 2, {from: buyer, value: 2*productPrice});
		let balance = await stores.getStorefrontBalance(storefrontId);
		assert.equal(balance, 2*productPrice);

		let contractBalance = await stores.getBalance();
		assert.equal(contractBalance, 2*productPrice);
	});

	it("Should refund someone if they pay more than the total", async() => {
		let marketplace = await Marketplace.new();
		let stores = await Stores.new(marketplace.address);
		let productPrice = web3.toWei(5, 'ether');
		let buyer = accounts[6];

		// Creating storefront 
		let storeOwner = accounts[1];
		await marketplace.approveStoreOwnerStatus(storeOwner, {from: accounts[0]});
		await stores.createStorefront("Test store", {from: storeOwner});
		let storefrontId = await stores.getStorefrontsId.call(storeOwner, 0); 

		// Add a product, get ID
		await stores.addProduct(storefrontId, "Test Product", "A test product", productPrice, 100, {from: storeOwner});
		let productId = await stores.addProduct.call(storefrontId, "Test Product", "A test product", productPrice, 100, {from: storeOwner});
		await stores.getProductCount(storefrontId);

		// Purchase the product for 2x the price and get transaction gas costs information
		let originalBuyerBalance = web3.eth.getBalance(buyer);;
		let receipt = await stores.purchaseProduct(storefrontId, productId, 1, {from: buyer, value: 2*productPrice, gas: 210000});
		let gasUsed = receipt.receipt.gasUsed;
		let tx = await web3.eth.getTransaction(receipt.tx);
		let gasPrice = tx.gasPrice;
		let gasCost = gasUsed * gasPrice;

		// Store should have a balance equal to the sold item price
		let storeBalance = await stores.getStorefrontBalance(storefrontId);
		assert.equal(storeBalance, productPrice);

		// Contract should have a balance equal to the sold item price
		let contractBalance = await stores.getBalance();
		assert.equal(contractBalance, productPrice);

		// Buyer should have a balance equal to their original balance minus the item price
		let buyerBalance = web3.eth.getBalance(buyer);
		assert.equal(buyerBalance.toNumber(), originalBuyerBalance-productPrice-gasCost);
	});

	it("Should allow storefront owners to withdraw their storefront's balance", async() => {
		let marketplace = await Marketplace.new();
		let stores = await Stores.new(marketplace.address);
		let productPrice = 100000;
		let buyer = accounts[5];

		// Creating storefront 
		let storeOwner = accounts[1];
		await marketplace.approveStoreOwnerStatus(storeOwner, {from: accounts[0]});
		await stores.createStorefront("Test store", {from: storeOwner});
		let storefrontId = await stores.getStorefrontsId.call(storeOwner, 0); 

		// Add a product, get ID
		await stores.addProduct(storefrontId, "Test Product", "A test product", productPrice, 100, {from: storeOwner});
		let productId = await stores.addProduct.call(storefrontId, "Test Product", "A test product", productPrice, 100, {from: storeOwner});
		await stores.getProductCount(storefrontId);

		// Purchase the product 
		await stores.purchaseProduct(storefrontId, productId, 1, {from: buyer, value: productPrice});
		let balance = await stores.getStorefrontBalance(storefrontId);
		assert.equal(balance, productPrice);
		// Contract should have a balance equal to the sold item price
		let contractBalance = await stores.getBalance();
		assert.equal(contractBalance, productPrice);

		// Withdraw the balance - contract and storefront should have 0 balance 
		await stores.withdrawStorefrontBalance(storefrontId, {from: storeOwner});
		balance = await stores.getStorefrontBalance(storefrontId);
		assert.equal(balance.toNumber(), 0);
		contractBalance = await stores.getBalance();
		assert.equal(contractBalance, 0);
	});
});

