# Solidity Marketplace (ConsenSys Developer Course Final Project)

This repository contains the implementation of a marketplace in Solidity. It is the final project for the ConsenSys Developer Bootcamp. 

# Requirements
## User Interface Requirements:
- [x] Run the app on a dev server locally for testing/grading
	- See `Running the Project` below. 
- [x] You should be able to visit a URL and interact with the application
	- The application will be at `http://localhost:3000/`
- [x] App recognizes current account
- [x] Sign transactions using MetaMask
	- Once MetaMask is configured to the application network (`localhost:8545`), users can interact with it using MetaMask
- [x] Contract state is updated
	- [x] Update reflected in UI
		- See `User Stories`. Updates require refreshing the page.  
 
## Test Requirements:
- [x] Write 5 tests for each contract you wrote
	- Most tests were written in Javascript, for flexibility
	- [x] Solidity 
		- See `/test/TestMarketplace.sol` and `/test/TestStores.sol`
	- [x] JavaScript
		- See `/test/marketplace.js` and `/test/stores.js`
- [ ] [TODO] Explain why you wrote those tests
- [x] Tests run with truffle test
	- Yes. See `Testing` under `Running the Project`
 
## [TODO] Design Pattern Requirements:
- [ ] Implement emergency stop
- [ ] What other design patterns have you used / not used?
	- [ ] Why did you choose the patterns that you did?
	- [ ] Why not others?
 
## [TODO] Security Tools / Common Attacks:
- [ ] Explain what measures you’ve taken to ensure that your contracts are not susceptible to common attacks

## [TODO] Other
- [ ] Use a library (via EthPM)

## [TODO] Stretch Requirement
- [ ] Integrate with an additional service, for example:
	- [ ] IPFS
	- [ ] uPort
	- [ ] Ethereum Name Service
	- [ ] Oracle

*** 

# Running the Project 
TODO. 

## Requirements 

## Getting Stared 

## Testing 

***

# User Stories
The goal of this section is to explain to graders how to use the app to evaluate the various user stories. 

#### Important 
	- You will need to refresh the page manually after a transaction has confirmed to see the updated state (ex: if creating a new storefront, wait for the transaction to confirm, refresh, and the storefront will be there)
	- Most transactions (ex: creating a storefront, withdrawing a balance, etc.) will require more gas than the default provided by MetaMask. Set the gas to `100000` or more when sending a transaction. 

## List Of Stores  
### Story
There are a list of stores on a central marketplace where shoppers can purchase goods posted by the store owners.

### Try It Out 
After having created storefronts (see below), go to the homepage (`http://localhost:3000/`) with an account that is neither an `admin` or `storeowner` and you will see a list of all storefronts. 


## Admin Marketplace Management 

### Story 
An administrator opens the web app. The web app reads the address and identifies that the user is an admin, showing them admin only functions, such as managing store owners. 

### Try It Out
The account that deploys the contract will by default be an `admin`. After deploying the contract, simply log into the first account on MetaMask associated with your passphrase and admin only functions will be shown. 

### Story 
An admin adds an address to the list of approved store owners, so if the owner of that address logs into the app, they have access to the store owner functions.

### Try It Out
The flow here is a bit different than in the story. To do this, first you will need to visit the homepage (`http://localhost:3000/`) with a **non** `admin` account, and click the `Request to be a store owner` button in the top-left of the page. 

Once your transaction has confirmed, switch back to an `admin` account and visit the homepage. Under the `Requested Store Owners` header, you should see the address of the account that has sent in the request. To make the address a `storeowner`, click the `Approve` button and submit the transaction. 

Once that transaction has confirmed, switch back to the account from which you created the request, and it should now display store owner functions. 

### Note
To add more admins, simply visit the home page as an `admin` and enter a desired `admin`'s address in the `Add Admin` form. After the transaction is confirmed, that account will now also be an `admin`. 

## Store Owner Functionality 

### Story 
An approved store owner logs into the app. The web app recognizes their address and identifies them as a store owner. They are shown the store owner functions. 

### Try It Out 
See `Admin Marketplace Management` above to make an account a `storeowner`. After this, the homepage (`http://localhost:3000/`) should display store owner functionality. 

### Story 
They can create a new storefront that will be displayed on the marketplace. They can also see the storefronts that they have already created. They can click on a storefront to manage it. 

### Try It Out 
With a `storeowner` account, on the homepage, you will see a `Create a storefront` section. There, you can enter the name for a new store front, and after clicking `Create`, it will be created. After the transaction has confirmed, refresh the page to see the new store front, along with its `id` and `balance` under `Your Storefronts
`. To manage the store front, simply click its name. 


### Story 
They can add/remove products to the storefront or change any of the products’ prices. 

### Try It Out 

#### Adding a Product
As a `storeowner`, click on any created storefront from the homepage. On the storefront page, (`http://localhost:3000/id={storefrontId}`), fill in the information in the `Add a Product` section, and click the button. After the transaction is confirmed, refresh the page and the product should appear in the `Products For Sale` section.  

#### [TODO] Remove a Product

#### Change A Product's Price 
As a `storeowner`, click on any created storefront from the homepage. On the storefront page, (`http://localhost:3000/id={storefrontId}`), after having added a product, in the `Products For Sale` section, you will be able to change a product's price by updating the value and submitting the `Update Product Price` form.

### Story 
They can  withdraw any funds that the store has collected from sales.

### Try It Out 
As a `storeowner`, visit the homepage (`http://localhost:3000/`). Under the name and ID of each store front, the balance will be listed. A `storeowner` can use the `Withdraw balance` button to withdraw the total balance of a  storefront. After the transaction has confirmed, the balance for that store front will now be 0, and the `storeowner`'s account balance will have been incremented by the total balance of the store. 

## Shopper Functionality 

### Story 
A shopper logs into the app. The web app does not recognize their address so they are shown the generic shopper application. From the main page they can browse all of the storefronts that have been created in the marketplace. Clicking on a storefront will take them to a product page. 

### Try It Out 
After having created at least one store front, simply visit the homepage (`http://localhost:3000/`) with any account that is neither an `admin` or `storeowner` to see a list of all store fronts with links to each of them. 

### Story 
They can see a list of products offered by the store, including their price and quantity. Shoppers can purchase a product, which will debit their account and send it to the store. The quantity of the item in the store’s inventory will be reduced by the appropriate amount.

### Try It Out 
To purchase a product, on a store front page, simply select the desired quantity and click `Buy`. A transaction will be created with the amount being the price of the product multiplied by the quantity. Once the transaction is confirmed, the value will be sent to the contract, and the quantity for the product will be updated after refreshing the page. 

## Full Requirements Document 

Additional information about the project can be found [here](https://docs.google.com/document/d/12dsvTYtXdjecSX089rx9jO71_CTVfsseVu3ZUumHX2E/edit).

# TODOs
- [ ] Implement "They can add/remove products to the storefront or change any of the products’ prices."
	- [ ] Deal with deletion of things better (maybe just add boolean attributes?) 
		- Probably best to just do "dumb deletes", a.k.a. set things to 0x0, and eventually add "smart adds / deletes"
	- [ ] Change product buttons for store owners to not buy their own products and instead be able to remove them and update the price or something 



