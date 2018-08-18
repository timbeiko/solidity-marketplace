import React, { Component } from 'react'
import { AccountData, ContractData, ContractForm } from 'drizzle-react-components'
import logo from '../../logo.png'
import PropTypes from 'prop-types'

class Home extends Component {

  constructor(props, context) {
    super(props);
    this.context = context;

  }


  render() {
    let requesterCount = <ContractData contract="Marketplace" method="getRequestedStoreOwnersLength" methodArgs={[{from: this.props.accounts[0]}]} />
    const requesters = []
    let Marketplace = this.context.drizzle.contracts.Marketplace
    let testRequesterCount = Marketplace.methods.getRequestedStoreOwnersLength().call(function (error, result) {
      for(let i=0; i<result; i++) {
        Marketplace.methods.getRequestedStoreOwner(i).call(function (error, res) {
          requesters.push({id: i, val:res})
        })
      }
    })
    console.log(requesters)

    function ListItem(props) {
      // Correct! There is no need to specify the key here:
      return <li>{props}</li>;
    }

    function NumberList(props) {
      const numbers = props.numbers;
      const listItems = numbers.map((number) =>
        // Correct! Key should be specified inside the array.
        <ListItem key={number.toString()}
                  value={number} />
      );

      return (
        <ul>
          {listItems}
        </ul>
      );
    }
    function reqList() {
      const reqList = {requesters.map((req) => <li key={req.id}> {req.val} </li>)}
      return reqList
    }
    
    return (
      <main className="container">
        <div className="pure-g">
          <div className="pure-u-1-1 header">
            <img src={logo} alt="drizzle-logo" />
            <h1>Drizzle Examples</h1>
            <p>Examples of how to get started with Drizzle in various situations.</p>

            <br/><br/>
          </div>

          <div className="pure-u-1-1">
            <h2>Active Account</h2>
            <AccountData accountIndex="0" units="ether" precision="3" />
            <br/><br/>
          </div>

          <div className="pure-u-1-1">
            <h2>Marketplace</h2>
            <p>Testing contract calls to Markeplace Contract</p>
            <p><strong>Marketplace Admin?</strong>: TBD </p>
            <p><strong>Number of Requests</strong>: {requesterCount} </p>
            <p><strong>Requested Admins</strong>: </p>
            <reqList/>

            <p><strong>Request Admin: </strong><ContractForm contract="Marketplace" method="requestStoreOwnerStatus"/></p>
            <br/><br/>
          </div>

          <div className="pure-u-1-1">
            <h2>SimpleStorage</h2>
            <p>This shows a simple ContractData component with no arguments, along with a form to set its value.</p>
            <p><strong>Stored Value</strong>: <ContractData contract="SimpleStorage" method="storedData" /></p>
            <ContractForm contract="SimpleStorage" method="set" />

            <br/><br/>
          </div>

          <div className="pure-u-1-1">
            <h2>TutorialToken</h2>
            <p>Here we have a form with custom, friendly labels. Also note the token symbol will not display a loading indicator. We've suppressed it with the <code>hideIndicator</code> prop because we know this variable is constant.</p>
            <p><strong>Total Supply</strong>: <ContractData contract="TutorialToken" method="totalSupply" methodArgs={[{from: this.props.accounts[0]}]} /> <ContractData contract="TutorialToken" method="symbol" hideIndicator /></p>
            <p><strong>My Balance</strong>: <ContractData contract="TutorialToken" method="balanceOf" methodArgs={[this.props.accounts[0]]} /></p>
            <h3>Send Tokens</h3>
            <ContractForm contract="TutorialToken" method="transfer" labels={['To Address', 'Amount to Send']} />

            <br/><br/>
          </div>

          <div className="pure-u-1-1">
            <h2>ComplexStorage</h2>
            <p>Finally this contract shows data types with additional considerations. Note in the code the strings below are converted from bytes to UTF-8 strings and the device data struct is iterated as a list.</p>
            <p><strong>String 1</strong>: <ContractData contract="ComplexStorage" method="string1" toUtf8 /></p>
            <p><strong>String 2</strong>: <ContractData contract="ComplexStorage" method="string2" toUtf8 /></p>
            <strong>Single Device Data</strong>: <ContractData contract="ComplexStorage" method="singleDD" />

            <br/><br/>
          </div>
        </div>
      </main>
    )
  }
}

Home.contextTypes = {
  drizzle: PropTypes.object
}

export default Home
