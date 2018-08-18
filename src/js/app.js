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

      return App.markAdopted();
    });

    $.getJSON('Marketplace.json', function(data) {
      var MarketplaceArtifact = data;
      App.contracts.Marketplace = TruffleContract(MarketplaceArtifact);
      App.contracts.Marketplace.setProvider(App.web3Provider);
      return App.checkAdmin();
    });

    return App.bindEvents();
  },

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


          // REMOVE THIS. Hack to populate the requested store owner array 
          MarketplaceInstance.requestStoreOwnerStatus();


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
          console.log("not owner");
        }
      });
    });
  },

  storeOwnerView: function() {
    document.getElementById("pageTitle").innerHTML = "Store Owner View"
  },

  adminView: function() {
    var marketplaceDiv = $('#marketplace');
    var requesterTemplate = $('#requesterTemplate'); 
    var approveButton = $('.btn-approve-requester');
    var MarketplaceInstance;
    document.getElementById("pageTitle").innerHTML = "Marketplace Administrator View"

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

  getRequesters: async function(length) {
    let requesters = [];
    let MarketplaceInstance = await App.contracts.Marketplace.deployed();

    for(i=0; i<length; i++) {
      let requester = await MarketplaceInstance.getRequestedStoreOwner(i);
      requesters.push(requester);
    }
    return requesters
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
        console.log(event.target);
      })
    });
  },

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
