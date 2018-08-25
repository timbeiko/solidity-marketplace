# Avoiding Common Attacks
See: https://consensys.github.io/smart-contract-best-practices/recommendations/

## External Calls
The only external call made by a contract is from the `Stores` to `Marketplace` contract (in `onlyStoreOwner`). The address of the `Marketplace` contract is set by the owner (i.e. the address that deploys the contract) in the constructor, and there is no way to change it. If a user trusts the addresses that have deployed the contracts, then the external call should be reasonably safe. 

## Avoid state changes after external calls
The only state change after an external call is in `createStorefront` in `Stores.sol`, because it is necessary to check in the `Marketplace` contract whether an address is marked as a `storeOwner`. For security purposes, this function (as well as all others that modify state) is pausable by the owner of the contract because of the `whenNotPaused` modifier. 

## Be aware of the tradeoffs between send(), transfer(), and call.value()()¶
Only `transfer()` is used to transfer value. It is used in `withdrawStorefrontBalance`, `removeStorefront` and `purchaseProduct`. 

## Handle errors in external calls
Not applicable.

## Favor pull over push for external calls
Not applicable. 

## Don't assume contracts are created with zero balance¶
This is not assumed anywhere, and withdrawals from `Stores.sol` are based on each storefront's `balance` value, which is stored separately from the total contract balance. 

## Remember that on-chain data is public
No issues here, as all data is meant to be visible in the UI. The only somewhat sensitive data are storefront balances, but these could be seen anyways once a store owner withdraws their balance. 

## In 2-party or N-party contracts, beware of the possibility that some participants may "drop offline" and not return
Unless the products on a storefront require physical delivery, this is not a problem. The worst case scenario would be that a storeowner does not return and does not claim their storefront balance. 

## Use assert() and require() properly
`assert()` is not used, but `require()` is used to validate input. See `design_pattern_decisions.md` for more details. 

## Explicitly mark visibility in functions and state variables
All function visibility is explicitly marked in `Marketplace.sol` and `Stores.sol`. All variables except contract addresses are set to `private`.

## Lock pragmas to specific compiler version
Version 0.4.24 is used for the `Marketplace`, `Stores` and `Migrations` contracts.

## Differentiate functions and events
Functions and events are differentiated in two ways:
1. Events will start with an uppercase character (ex: AdminAdded) and functions with a lowercase one (ex: addAdmin)
2. Events will use past tense verbs (ex: BalanceWithdrawn) and functions will use present tense verbs (ex: withdrawStorefrontBalance)

## Prefer newer Solidity constructs
- `selfdestruct` is used over `suicide` (see `Destructible.sol`)
- `transfer` is used over `require(msg.sender.send())` (see `Stores.sol`)
- `keccak256` is used over `sha3` (see: `Stores.sol`)

## Avoid using tx.origin
`tx.origin` is not used. 

## Timestamp Dependence
Timestamps are only used to generate IDs for products and storefronts. The goal is for these to be unique, and they do not have any security implications. 

## Multiple Inheritance Caution
While the contracts do have multiple inheritances, they are inherited from Most General to Most Specific (and the compiler will not work otherwise). Also, the functionality of the inherited contracts is tested.
