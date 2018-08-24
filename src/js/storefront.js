const promisify = (inner) =>
  new Promise((resolve, reject) =>
    inner((err, res) => {
      if (err) { reject(err) }
      resolve(res);
    })
  );

const getBalance = (account, at) =>
  promisify(cb => web3.eth.getBalance(account, at, cb));

App = {
  web3Provider: null,
  contracts: {},
  storefrontID: null,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 != 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.when(
      $.getJSON('Marketplace.json', function(data) {
        var MarketplaceArtifact = data;
        App.contracts.Marketplace = TruffleContract(MarketplaceArtifact);
        App.contracts.Marketplace.setProvider(App.web3Provider);
      }),

      $.getJSON('Stores.json', function(data) {
        var StoresArtifact = data;
        App.contracts.Stores = TruffleContract(StoresArtifact);
        App.contracts.Stores.setProvider(App.web3Provider);
      })
    ).then(function() {

      // Get storefront ID from URL
      var vars = {};
      var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
      });
      App.storefrontID = vars["id"]; 

      return App.checkStoreOwner();
    });
  },

  checkStoreOwner: function() {
    var MarketplaceInstance;
    web3.eth.getAccounts(async function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      let StoresInstance = await App.contracts.Stores.deployed();
      let storefrontOwnerAddress = await StoresInstance.getStorefrontOwner(App.storefrontID);

      if (account === storefrontOwnerAddress) {
        return App.storeOwnerView();
      } else {
        return App.defaultView();
      }
    });
  },

  // View setup functions
  defaultView: function() {
    $('#storeOwnerView').attr('style', 'display: none;');
    App.productListView();
  },

  storeOwnerView: function() {
    $('#storeOwnerView').attr('style', '');
    $('#defaultView').attr('style', 'display: none;');
    App.addProduct();
    // App.deleteStorefront(); // Need to convert to delete product
    App.productListView();
  },

  
  addProduct: function() {
    var StoresInstance;

    $('#addProduct').submit(function( event ) {
      let name = $("input#productName").val();
      let desc = $("input#productDesc").val();
      let price = $("input#productPrice").val();
      let qty = $("input#productQty").val();


      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }
        var account = accounts[0];
        App.contracts.Stores.deployed().then(function(instance) {
          StoresInstance = instance;
          return StoresInstance.addProduct(
            App.storefrontID,
            name,
            desc,
            web3.toWei(Number(price)),
            Number(qty), {from: account});
        });
      });
      event.preventDefault();
    });
  },

  productListView: async function(e) {
    var productsDiv = $('#products');
    var productTemplate = $('#productTemplate'); 
    var productUpdateForm = $('.updateProduct');
    var productPurchaseForm = $('#buyProduct');

    let accounts = web3.eth.accounts;
    let account = accounts[0];
    let StoresInstance = await App.contracts.Stores.deployed();
    
    let storefrontName = await StoresInstance.getStorefrontName(App.storefrontID);
    document.getElementById("pageTitle").innerHTML = storefrontName;
    document.title = storefrontName;

    let productsLength = await StoresInstance.getProductCount(App.storefrontID);
    let productIDs = await App.getProducts(Number(productsLength), account);

    let storefrontOwnerAddress = await StoresInstance.getStorefrontOwner(App.storefrontID);

    for(i=0; i<productIDs.length; i++) {
      let product = await StoresInstance.getProduct(productIDs[i]);
      productTemplate.find('#productName').text(product[0]);
      productTemplate.find('#productDesc').text(product[1]);
      productTemplate.find('#productPrice').text(web3.fromWei(Number(product[2])));
      productTemplate.find('#productQuantity').text(Number(product[3]));
      productTemplate.find('#productID').text(productIDs[i]);

      // Different buttons for storeowners vs. purchasers 
      if (storefrontOwnerAddress === account) {
        productUpdateForm.attr('style', '');
        productUpdateForm.find('#productID').attr("value", productIDs[i]);
      } else {
        productPurchaseForm.attr('style', '');
        productPurchaseForm.find('#purchaseQty').attr("max", Number(product[3]));
        productPurchaseForm.find('#productID').attr("value", productIDs[i]);
        productPurchaseForm.find('#purchasePrice').attr("value", web3.fromWei(Number(product[2])));
      }
      productsDiv.append(productTemplate.html());
    }

    App.updateProductPrice();
    App.purchaseProduct();
  },

  purchaseProduct: function() {
    var StoresInstance;

    $('#buyProduct').submit(function( event ) {
      let qty = $(this).closest("form").find("input[name='qty']").val();
      let id = $(this).closest("form").find("input[name='id']").val();
      let price = $(this).closest("form").find("input[name='price']").val();

      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }
        var account = accounts[0];
        App.contracts.Stores.deployed().then(function(instance) {
          StoresInstance = instance;
          return StoresInstance.purchaseProduct(
            App.storefrontID,
            id,
            qty, {from: account, value: web3.toWei(qty*price)});
        });
      });
      event.preventDefault();
    });
  },

  updateProductPrice: function() {
    $('.updateProduct').submit(function( event ) {
      let id = $(this).closest("form").find("input[name='id']").val();
      let price = $(this).closest("form").find("input[name='price']").val();

      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }
        var account = accounts[0];
        App.contracts.Stores.deployed().then(function(instance) {
          StoresInstance = instance;
          return StoresInstance.updateProductPrice(
            App.storefrontID,
            id,
            web3.toWei(price), {from: account});
        });
      });
      event.preventDefault();
    });
  },

  getProducts: async function(length, account) {
    let productIDs = [];
    let StoresInstance = await App.contracts.Stores.deployed();

    for(i=0; i<length; i++) {
      let sf = await StoresInstance.getProductId(App.storefrontID, i);
      productIDs.push(sf);
    }

    // Remove duplicates
    let s = new Set(productIDs);
    let vals = s.values();
    return Array.from(vals); 
  },

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});