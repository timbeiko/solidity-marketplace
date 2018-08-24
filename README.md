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
 
## [TODO] Design Pattern Requirements (in design_pattern_desicions.md):
- [ ] Implement emergency stop
- [ ] What other design patterns have you used / not used?
	- [ ] Why did you choose the patterns that you did?
	- [ ] Why not others?
 
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

*** 

# Running the Project 

## Requirements 

To run this project, you will need the following:
- Truffle (`npm install -g truffle`)
- Ganache CLI (`npm install -g ganache-cli`)
	- You can also use the Ganache Application

## Getting Stared 

After cloning this repository, 

## Testing 

## Project Requirements 

To see how to test the project for the given requirements, see `user_stories.md`

## Full Requirements Document 

Additional information about the project can be found [here](https://docs.google.com/document/d/12dsvTYtXdjecSX089rx9jO71_CTVfsseVu3ZUumHX2E/edit).

***

# TODOs
- [ ] Implement "They can add/remove products to the storefront or change any of the products’ prices."
	- [ ] Deal with deletion of things better (maybe just add boolean attributes?) 
		- Probably best to just do "dumb deletes", a.k.a. set things to 0x0, and eventually add "smart adds / deletes"

