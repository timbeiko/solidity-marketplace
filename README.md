# Solidity Marketplace (ConsenSys Developer Course Final Project)

This repository contains the implementation of a marketplace in Solidity. It is the final project for the ConsenSys Developer Bootcamp. 

*** 

# Running the Project 

## Requirements 

To run this project, you will need the following:
- Truffle (`npm install -g truffle`)
- Ganache CLI (`npm install -g ganache-cli`)
	- You can also use the Ganache Application
- MetaMask 

## Getting Stared 

After cloning this repository, open two terminal windows and `cd` into the top-level directory of this project.
In the first terminal window, run `ganache-cli` to start your local blockchain. Copy the mnemonic phrase (12 words) to your clipboard. 

In the second terminal window, run `truffle migrate` to deploy your contracts on your local blockchain. Once the migration is complete, run `npm run dev` for the application to start. A window should automatically open to `localhost:3000`. If not, open your browser which uses MetaMask and enter `localhost:3000` as the URL. 

Open the MetaMask extension, Log Out of your current account (**if your current account is on the main net, be sure to save your mnemonic/passphrase somewhere!**), and then click "Restore from seed phrase". Paste the seed phrase you have copied from the `ganache-cli` terminal window and set a temporary password. 

Once logged into your account, choose `Custom RPC` as your network and in the `New RPC URL` form, copy/paste the IP address from the which the `ganache-cli` terminal is `Listening on` (it is likely `127.0.0.1:8545` and you will need to scroll up in your terminal window to when you started `ganache-cli` to see it). 

After this, you should be able to use MetaMask to interact with the application. If you are logged in properly and on the right network, you will see the `Administrator View` once MetaMask is configured, after refreshing the page.

## Testing 

To run the tests, open two terminal windows from the top-level directory of the project. In the first, run `ganache-cli` to start your local blockchain, and in the second, run `truffle test` to run all the tests.

All tests should pass, but tests that involve buying products sometimes fail because of rounding errors. If this is the case, you should see an error such as `AssertionError: expected 89987387000000000000 to equal 89987386999999990000`. You can typically get the tests to pass by simply re-running them. The rounding errors tend to happen if you run the tests over and over on the same blockchain with the same accounts (i.e. without restarting `ganache-cli`). Simply restarting the local blockchain can sometimes make everything pass. 

Each of the two contracts has `.sol` and `.js` tests, all located under `/test`. For more explanations around  tests, see `testing_rationale.md`. 

## Project Requirements 

The project requirements are described below.
To see how to test the project for the required functionality, see `user_stories.md`

*** 

# Project Requirements

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
	- See `testing_rationale.md`
- [x] Tests run with truffle test
	- Yes. See `Testing` under `Running the Project`
 
## [TODO] Design Pattern Requirements:
- [ ] Implement emergency stop
- [ ] What other design patterns have you used / not used?
	- See `design_pattern_desicions.md`
 
## [TODO] Security Tools / Common Attacks (in avoiding_common_attacks.md):
- [ ] Explain what measures you’ve taken to ensure that your contracts are not susceptible to common attacks

## Other
- [x] Use a library (via EthPM)
	- The `zeppelin` library is used (installed under `/installed_contracts/zeppelin`)
- [ ] [TODO] "Smart Contract code should be commented according to the specs in [the documentation](https://solidity.readthedocs.io/en/v0.4.21/layout-of-source-files.html#comments)

## [TODO] Stretch Requirement
- [ ] Deploy on a test net 
- [ ] Integrate with an additional service, for example:
	- [ ] IPFS
	- [ ] uPort
	- [ ] Ethereum Name Service
	- [ ] Oracle

## Full Requirements Document 

Additional information about the project can be found [here](https://docs.google.com/document/d/12dsvTYtXdjecSX089rx9jO71_CTVfsseVu3ZUumHX2E/edit).


***

# TODOs
- [ ] Implement "They can add/remove products to the storefront or change any of the products’ prices."
	- [ ] Deal with deletion of things better (maybe just add boolean attributes?) 
		- Probably best to just do "dumb deletes", a.k.a. set things to 0x0, and eventually add "smart adds / deletes"

