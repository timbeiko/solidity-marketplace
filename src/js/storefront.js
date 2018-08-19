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
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];

      App.contracts.Marketplace.deployed().then(function(instance) {
        MarketplaceInstance = instance;
        return MarketplaceInstance.checkStoreOwnerStatus(account);
      }).then(function(isOwner) {
        if (isOwner) {
          return App.storeOwnerView();
        } else {
          return App.defaultView();
        }
      });
    });
  },

  // View setup functions
  defaultView: function() {
    document.getElementById("pageTitle").innerHTML = "Welcome To The Marketplace!"
    $('#storeOwnerView').attr('style', 'display: none;');
  },

  storeOwnerView: function() {
    document.getElementById("pageTitle").innerHTML = "Store Owner View"
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
            Number(price),
            Number(qty), {from: account});
        });
      });
      event.preventDefault();
    });
  },

  // Convert this to "delete product" later
  // deleteStorefront: function() {
  //   let id;
  //   var StoresInstance;

  //   $('#deleteStorefront').submit(function( event ) {
  //     id = $("input#storefrontId").val();
  //     web3.eth.getAccounts(function(error, accounts) {
  //       if (error) {
  //         console.log(error);
  //       }
  //       var account = accounts[0];
  //       App.contracts.Stores.deployed().then(function(instance) {
  //         StoresInstance = instance;
  //         return StoresInstance.removeStorefront(id, {from: account});
  //       });
  //     });
  //     event.preventDefault();
  //   });
  // },

  productListView: async function(e) {
    var productsDiv = $('#products');
    var productTemplate = $('#productTemplate'); 
    var productPurchaseForm = $('#buyProduct');

    let accounts = web3.eth.accounts;
    let account = accounts[0];
    let StoresInstance = await App.contracts.Stores.deployed();
    let productsLength = await StoresInstance.getProductCount(App.storefrontID);
    let productIDs = await App.getProducts(Number(productsLength), account);

    for(i=0; i<productIDs.length; i++) {
      let product = await StoresInstance.getProduct(productIDs[i]);
      console.log(product);
      productTemplate.find('#productName').text(product[0]);
      productTemplate.find('#productDesc').text(product[1]);
      productTemplate.find('#productPrice').text(Number(product[2]));
      productTemplate.find('#productQuantity').text(Number(product[3]));
      productTemplate.find('#productID').text(productIDs[i]);
      productPurchaseForm.find('#purchaseQty').attr("max", Number(product[3]));
      productPurchaseForm.find('#productID').attr("value", productIDs[i]);
      productPurchaseForm.find('#productPrice').attr("value", Number(product[2]));
      productsDiv.append(productTemplate.html());
    }
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