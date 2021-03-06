# Design Pattern Decisions

## Circuit Breaker
Zeppelin's `Pausable` library is extended to both the `Marketplace.sol` and `Stores.sol` contracts. 

The contract owner (i.e. the address that has deployed the contract) can therefore pause any of them. 
When paused, all methods that cause changes in the administrators, storefronts, products or, most importantly, balances, cannot be used. 

There are no functions that are only usable if the contract is paused, but because the contract is `Destructible`, the owner could pause the contract, withdraw the contract balance, and then manually send each store owner their storefront balances if needed. For an idea about how `whenPaused` functions could be used, see the `Speed Bump` section below. 

The pausable functions have the `whenNotPaused` modifier. 

## Fail early and fail loud
Used `require` to trigger an error instead of `if` in the following modifiers and functions:

#### Marketplace.sol 
- onlyAdmin()
- removeAdmin(address admin) 
- requestStoreOwnerStatus() 

#### Stores.sol 
- onlyStoreOwner()
- onlyStorefrontOwner(bytes32 id)
- withdrawStorefrontBalance(bytes32 storefrontId) 
- purchaseProduct(bytes32 storefrontId, bytes32 productId, uint qty) 

## Restricting Access
The following modifiers restrict access to certain functions: 

#### Marketplace.sol 
- onlyAdmin()

#### Stores.sol 
- onlyStoreOwner()
- onlyStorefrontOwner(bytes32 id)

## Auto Deprecation
Not used. Nothing in the application should expire/be deprecated.

## Mortal
Both `Marketplace.sol` and `Stores.sol` extend Zeppelin's `Destructible` contract and hence are mortal.

## Pull over Push Payments
The `payable` function in `Stores.sol` is `purchaseProduct`. This function does not transfer funds to the `storeOwner` directly, but increments the storefront's `balance`. Withdrawals can then be done via the `withdrawStorefrontBalance` method. Both these functions are also pausable, because they each have the `whenNotPaused` modifier. 

## State Machine
Not used, but could be interesting to use if states were added to the products (ex: purchased, shipped, etc.). For now, this is not needed. 

## Speed Bump
Not used. Could be interesting to use it in conjunction with the `Pausable` functionality. For example, if we had a `SlowWithdraw` function that allowed `storeOwners` to withdraw their storefront balances N blocks after the contract had been paused. 
