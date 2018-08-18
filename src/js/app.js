App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

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
    $.getJSON('Adoption.json', function(data) {
      var AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);
      App.contracts.Adoption.setProvider(App.web3Provider);
      App.bindEvents();
      return App.markAdopted();
    });

    $.getJSON('Marketplace.json', function(data) {
      var MarketplaceArtifact = data;
      App.contracts.Marketplace = TruffleContract(MarketplaceArtifact);
      App.contracts.Marketplace.setProvider(App.web3Provider);
    });


    $.getJSON('Stores.json', function(data) {
      var StoresArtifact = data;
      App.contracts.Stores = TruffleContract(StoresArtifact);
      App.contracts.Stores.setProvider(App.web3Provider);
    });


    return App.checkAdmin();
  },

  // Status validation functions
  checkAdmin: function() {
    var MarketplaceInstance;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Marketplace.deployed().then(function(instance) {
        MarketplaceInstance = instance;
        return MarketplaceInstance.checkAdmin(account);
      }).then(function(isAdmin) {
        if (isAdmin) {
          return App.adminView();
        } else {
          return App.checkStoreOwner();
        }
      });
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
    $('#defaultView').attr('style', '');
    $('#adminView').attr('style', 'display: none;');
    $('#storeOwnerView').attr('style', 'display: none;');

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
     $('.btn-request-store').attr('data-addr', accounts[0]);
    });

    $('.btn-request-store').attr('data-addr', "test");
    $(document).on('click', '.btn-request-store', App.requestStoreOwnerStatus);
  },

  storeOwnerView: function() {
    document.getElementById("pageTitle").innerHTML = "Store Owner View"
    $('#storeOwnerView').attr('style', '');
    $('#adminView').attr('style', 'display: none;');
    $('#defaultView').attr('style', 'display: none;');
    App.createStorefront();
    App.storefrontListView();
  },

  adminView: function() {
    document.getElementById("pageTitle").innerHTML = "Marketplace Administrator View"
    $('#adminView').attr('style', '');
    $('#storeOwnerView').attr('style', 'display: none;');
    $('#defaultView').attr('style', 'display: none;');

    // Configure forms and buttons 
    App.removeStoreOwnerStatus();
    App.addAdmin();
    App.removeAdmin();
    $(document).on('click', '.btn-clear-list', App.removeStoreOwnersFromRequestList);
    return App.requesterListView();
  },

  requesterListView: function() {
    var marketplaceDiv = $('#marketplace');
    var requesterTemplate = $('#requesterTemplate'); 
    var approveButton = $('.btn-approve-requester');
    var MarketplaceInstance;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Marketplace.deployed().then(function(instance) {
        MarketplaceInstance = instance;
        return MarketplaceInstance.getRequestedStoreOwnersLength();
      }).then(function(length) {
        return App.getRequesters(length);
      }).then(function(requesters) {
        for(i=0; i<requesters.length; i++) {
          requesterTemplate.find('.requesterAddress').text(requesters[i]);
          approveButton.attr('data-addr', requesters[i]);
          marketplaceDiv.append(requesterTemplate.html());
          $(document).on('click', '.btn-approve-requester', App.approveRequester);
        }
      })
    });
  },

  // Marketplace functions
  requestStoreOwnerStatus: function(event) {
    var requesterAddr = $(event.target).data('addr');
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      var MarketplaceInstance;
      App.contracts.Marketplace.deployed().then(function(instance) {
        MarketplaceInstance = instance;
        return MarketplaceInstance.requestStoreOwnerStatus({from: account});
      }).then(function(){
        $(event.target).text('Request sent').attr('disabled', true);
      });
    });
  },

  removeStoreOwnerStatus: function() {
    var addr;
    var MarketplaceInstance;

    $('#removeStoreOwner').submit(function( event ) {
      addr = $( "input:first" ).val();
      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }
        var account = accounts[0];
        App.contracts.Marketplace.deployed().then(function(instance) {
          MarketplaceInstance = instance;
          return MarketplaceInstance.removeStoreOwnerStatus(addr, {from: account});
        });
      });
      event.preventDefault();
    });
  },

  addAdmin: function() {
    let addr;
    var MarketplaceInstance;

    $('#addAdmin').submit(function( event ) {
      addr = $("input#adminAddrAdd").val();
      console.log(addr);
      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }

        var account = accounts[0];
        App.contracts.Marketplace.deployed().then(function(instance) {
          MarketplaceInstance = instance;
          console.log(addr)
          return MarketplaceInstance.addAdmin(addr, {from: account});
        });
      });
      event.preventDefault();
    });
  },

  removeAdmin: function() {
    var addr;
    var MarketplaceInstance;

    $('#removeAdmin').submit(function( event ) {
      addr = $( "input#adminAddrRem" ).val();
      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }
        var account = accounts[0];
        App.contracts.Marketplace.deployed().then(function(instance) {
          MarketplaceInstance = instance;
          return MarketplaceInstance.removeAdmin(addr, {from: account});
        });
      });
      event.preventDefault();
    });
  },

  // Some of the validation that's being done here should maybe 
  // be done in Marketplace.sol instead 
  getRequesters: async function(length) {
    let requesters = [];
    let MarketplaceInstance = await App.contracts.Marketplace.deployed();

    for(i=0; i<length; i++) {
      let requester = await MarketplaceInstance.getRequestedStoreOwner(i);
      // Check if a requester is already a store owner. Only add to array if not.
      let isStoreOwner = await MarketplaceInstance.checkStoreOwnerStatus(requester);
      if (!isStoreOwner) {
        requesters.push(requester);
      }
    }

    // Remove duplicates 
    let s = new Set(requesters);
    let vals = s.values();
    return Array.from(vals);
  },

  approveRequester: function(event) {
    var requesterAddr = $(event.target).data('addr');
    var MarketplaceInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      App.contracts.Marketplace.deployed().then(function(instance) {
        MarketplaceInstance = instance;
        return MarketplaceInstance.approveStoreOwnerStatus(requesterAddr, {from: account});
      }).then(function() {
        $(event.target).text('Approved!').attr('disabled', true);
      })
    });
  },

  removeStoreOwnersFromRequestList: function(event) {
    var MarketplaceInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];

      App.contracts.Marketplace.deployed().then(function(instance) {
        MarketplaceInstance = instance;
        return MarketplaceInstance.removeStoreOwnersFromRequestList({from: account});
      }).then(function() {
        $(event.target).text('Done!').attr('disabled', true);
      })
    });
  },

  // Storefront functions 
  createStorefront: function() {
    let name;
    var StoresInstance;

    $('#createStorefront').submit(function( event ) {
      name = $("input#storefrontName").val();
      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }
        var account = accounts[0];
        App.contracts.Stores.deployed().then(function(instance) {
          StoresInstance = instance;
          return StoresInstance.createStorefront(name, {from: account});
        });
      });
      event.preventDefault();
    });
  },

  storefrontListView: function(e) {
    var storefrontsDiv = $('#storefronts');
    var storefrontTemplate = $('#storefrontTemplate'); 
    var StoresInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Stores.deployed().then(function(instance) {
        StoresInstance = instance;
        return StoresInstance.getStorefrontCount(account);
      }).then(function(length) {
        return App.getStorefronts(Number(length), account);
      }).then(function(storefronts) {
        for(i=0; i<storefronts.length; i++) {
          storefrontTemplate.find('#storefrontId').text(storefronts[i]);
          storefrontsDiv.append(storefrontTemplate.html());
        }
      })
    });
  },

  getStorefronts: async function(length, account) {
    let storefronts = [];
    let StoresInstance = await App.contracts.Stores.deployed();

    for(i=0; i<length; i++) {
      let sf = await StoresInstance.getStorefrontsId(account, i);
      storefronts.push(sf);
    }

    // Remove duplicates, if any
    let s = new Set(storefronts);
    let vals = s.values();
    return Array.from(vals); 
  },

  // Pet Shop Box functions 
  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  markAdopted: function(adopters, account) {
    var adoptionInstance; 

    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;
      return adoptionInstance.getAdopters.call();
    }).then(function(adopters) {
      for(i=0; i<adopters.length; i++) {
        if (adopters[i] != '0x0000000000000000000000000000000000000000') {
          $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    var adoptionInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;

        return adoptionInstance.adopt(petId, {from: account});
      }).then(function(result) {
        return App.markAdopted();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
