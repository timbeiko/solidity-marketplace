
function buildObservedEventsForComparison(observedTransactionResult, expectedEvents, filterByName) {
  let observedEvents = new Array();

  observedTransactionResult.logs.forEach(function(logEntry) {
    let expectedEntry = expectedEvents.find(function(evt) {
      return (evt.event === logEntry.event)
    });

    // When filtering, ignore events that are not expected
    if ((! filterByName) || expectedEntry) {
      // Event name
      let event = {
        event: logEntry.event
      };

      // Event arguments
      // Ignore the arguments when they are not tested
      // (ie. expectedEntry.args is undefined)
      if ((! expectedEntry) || (expectedEntry && expectedEntry.args)) {
        event.args = Object.keys(logEntry.args).reduce(function(previous, current) {
          previous[current] =
            (typeof logEntry.args[current].toNumber === 'function')
              ? logEntry.args[current].toNumber()
              : logEntry.args[current];
          return previous;
        }, {});
      }

      observedEvents.push(event);
    }
  });

  return observedEvents;
}

module.exports = {
  init: function() {
    if (typeof assert !== 'undefined') {
      assert.web3AllEvents = function(observedTransactionResult, expectedEvents, message) {
        let entries = buildObservedEventsForComparison(observedTransactionResult, expectedEvents, false);
        assert.deepEqual(entries, expectedEvents, message);
      };
      assert.web3Events = assert.web3AllEvents;

      assert.web3SomeEvents = function(observedTransactionResult, expectedEvents, message) {
        let entries = buildObservedEventsForComparison(observedTransactionResult, expectedEvents, true);
        assert.deepEqual(entries, expectedEvents, message);
      };

      assert.web3Event = function(observedTransactionResult, expectedEvent, message) {
        assert.web3SomeEvents(observedTransactionResult, [expectedEvent], message);
      };
    }

    if (typeof expect !== 'undefined') {
      expect.web3AllEvents = function(observedTransactionResult, expectedEvents, message) {
        let entries = buildObservedEventsForComparison(observedTransactionResult, expectedEvents, false);
        expect(entries).to.deep.equal(expectedEvents);
      };
      expect.web3Events = expect.web3AllEvents;

      expect.web3SomeEvents = function(observedTransactionResult, expectedEvents, message) {
        let entries = buildObservedEventsForComparison(observedTransactionResult, expectedEvents, true);
        expect(entries).to.deep.equal(expectedEvents);
      };

      expect.web3Event = function(observedTransactionResult, expectedEvent, message) {
        expect.web3SomeEvents(observedTransactionResult, [expectedEvent], message);
      };
    }
  }
}
