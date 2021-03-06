/** To deploy on rinkeby, you will need a `secret.js` file 
* in the top level directory with the following contents:
// Start of secret.js 
module.exports = {
   mnemonic: function() {
      return "YOUR TWELVE WORD MNEMONIC";
   }
}
// End of secret.js 
*/ 
var secret = require("./secret");
var HDWalletProvider = require("truffle-hdwallet-provider");
var infura_apikey = "926fa142e0e84a0ba59c2cad193fd08b";

module.exports = {
  migrations_directory: "./migrations",
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    }, 
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(secret.mnemonic(), "https://rinkeby.infura.io/v3/926fa142e0e84a0ba59c2cad193fd08b")
      },
      network_id: 4,
      gas: 6017891,
    },   
  },
 compilers: {
  solc: {
    version: "0.4.24",  
    }
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 500
    }
  } 
};
