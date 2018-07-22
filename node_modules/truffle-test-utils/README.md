# truffle-test-utils

Utils to support Truffle's JavaScript tests for Ethereum smart contracts.

## Install

    npm install truffle-test-utils

## How to use

To use these helpers, include them at the top of your tests:

    require('truffle-test-utils').init();

## Utils

### Event testing

#### Single event

To make sure a smart contract call generates the expected event:

    // Regular call thanks to Truffle
    let result = await testedSmartContract.testedFunction();
    // Check event
    assert.web3Event(result, {
      event: 'TestedEvent',
      args: {
        param_1: 'Some value',
        param_2: 0x123456 // No need for toNumber hassle
      }
    }, 'The event is emitted');

By omitting the `args` parameter, only the event itself is tested,
no matter what its arguments are:

    let result = await testedSmartContract.testedFunction();
    assert.web3Event(result, {
      event: 'TestedEvent'
      // Any argument is allowed
    }, 'The event is emitted');

So to make sure that an event has no arguments, pass an empty hash:

    let result = await testedSmartContract.testedFunction();
    assert.web3Event(result, {
      event: 'TestedEvent',
      args: {} // Event should have no argument at all
    }, 'The event is emitted');

Note that `assert.web3Event` makes sure that a particular event is emitted.
If other events are emitted too, they are simply ignored.

#### Mutliple events

You can check several events at once with `assert.web3SomeEvents` and
`assert.web3AllEvents`.

`assert.web3SomeEvents` checks the expected events and ignore additional events:

    let result = await testedSmartContract.testedFunction();
    assert.web3Events(result, [
      { event: 'E1' }, // testedFunction must emit E1
      { event: 'E2' }  // testedFunction must emit E2
       // What if testedFunction emits E3 too? It's okay
    ]);

`assert.web3AllEvents` checks that the expected events are emitted and no others:

    let result = await testedSmartContract.testedFunction();
    assert.web3AllEvents(result, [
      { event: 'E1' }, // testedFunction must emit E1
      { event: 'E2' }  // testedFunction must emit E2
       // What if testedFunction emits E3 too? The test fails
    ]);

`assert.web3Events` is an alias to `assert.web3AllEvents`.

#### `expect`

If you prefer `expect`, you can use it in place of `assert`:

    // Regular call thanks to Truffle
    let result = await testedSmartContract.testedFunction();
    // Check event
    expect.web3Event(result, {
      event: 'TestedEvent',
      args: {
        param_1: 'Some value',
        param_2: 0x123456 // No need for toNumber hassle
      }
    }, 'The event is emitted');
