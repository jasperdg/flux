import React, { Component } from 'react';
import Markets from './Markets';
import '../styles/App.css';
import Header from './Header';
import SplashScreen from './SplashScreen';

class App extends Component {
  state = {
    near: null,
    walletAccount: null,
    accountId: null,
    contract: null,
    isSignedIn: null,
    markets: [],
    showMarkets: true,
    account: null,
    accountState: null
    // loading: true
  }

  async componentDidMount() {
    const near = await window.nearlib.connect(Object.assign({ deps: { keyStore: new window.nearlib.keyStores.BrowserLocalStorageKeyStore() } }, window.nearConfig));
    const walletAccount = new window.nearlib.WalletAccount(near);
    const accountId = walletAccount.getAccountId();
    const isSignedIn = walletAccount.isSignedIn();
    const contract = await near.loadContract(window.nearConfig.contractName, {
      viewMethods: ["get_all_markets", "get_market"],
      changeMethods: ["create_market", "delete_market", "place_order", "resolute_market", "claim_earnings"],
      sender: accountId,
    });


    let account = null;
    let accountState = null;

    if (isSignedIn) {
      account = await near.account(walletAccount.getAccountId());
      accountState = await account.state();
    }
    
    // const markets = await contract.get_all_markets();
    // console.log(markets);
    this.setState({
      near,
      walletAccount,
      accountId,
      contract,
      isSignedIn,
      // markets,
      account,
      accountState
    });

    // setTimeout(() => {
    //   this.setState({loading: false});
    // }, 2000)
  }

  getAndUpdateMarkets = async () => {
    const markets = await this.state.contract.get_all_markets();
    this.setState({markets});
  }

  createMarket = async () => {
    await this.state.contract.create_market({outcomes: 2,description: "will x happen by T", end_time: 123412341234});
    this.getAndUpdateMarkets();
  }

  deleteMarket = async (id) => {
    await this.state.contract.delete_market({id: id});
    this.getAndUpdateMarkets();
  }


  placeOrder = async (marketId, outcome, amount, price) => {
    console.log(this.state.contract);
    const res = await this.state.account.functionCall(
      window.nearConfig.contractName, 
      "place_order", 
      {
        market_id: 0, 
        outcome: 1, 
        amount: 100000, 
        price: 50
      },
      95344531
    );
    console.log("RESPONSE:" , res)
  }

  resoluteMarket = async (marketId, outcome, amount, price) => {
    const res = await this.state.account.functionCall(
      window.nearConfig.contractName, 
      "resolute", 
      {
        market_id: 0, 
        payout: [10000, 0],
        invalid: false
      },
      95344531
    );
    console.log("RESPONSE:" , res)
  }

  claimEarnings = async (marketId, outcome, amount, price) => {
    const res = await this.state.account.functionCall(
      window.nearConfig.contractName, 
      "claim_earnings", 
      {
        market_id: 0
      },
      95344531
    );
    console.log("RESPONSE:" , atob(res.transactions[1].result.result));
  }


  render() {
    console.log(this.state.account);
    return (
      <div className="App">
        <button onClick={this.createMarket}> hi</button>
        <button onClick={this.getAndUpdateMarkets}> bye</button>
        <button onClick={this.placeOrder}> slye</button>
        <button onClick={this.resoluteMarket}> rye</button>
        <button onClick={this.claimEarnings}> cye</button>

        {this.state.loading && <SplashScreen />}
        <Header account={this.state.accountState} isSignedIn={this.state.isSignedIn} walletAccount={this.state.walletAccount}/>
        {this.state.showMarkets ? <Markets placeOrder={this.placeOrder} deleteMarket={this.deleteMarket} contract={this.state.contract} markets={this.state.markets}/> : null}
      </div>
    );
  }
}

export default App;
