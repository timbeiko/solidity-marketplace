import ComplexStorage from './../build/contracts/ComplexStorage.json'
import SimpleStorage from './../build/contracts/SimpleStorage.json'
import TutorialToken from './../build/contracts/TutorialToken.json'
import Killable from './../build/contracts/Killable.json'
import Marketplace from './../build/contracts/Marketplace.json'
import Ownable from './../build/contracts/Ownable.json'
import Stores from './../build/contracts/Stores.json'



const drizzleOptions = {
  web3: {
    block: false,
    fallback: {
      type: 'ws',
      url: 'ws://127.0.0.1:8545'
    }
  },
  contracts: [
    ComplexStorage,
    SimpleStorage,
    TutorialToken,
    Marketplace,
    Stores
  ],
  events: {
    SimpleStorage: ['StorageSet']
  },
  polls: {
    accounts: 1500
  }
}

export default drizzleOptions