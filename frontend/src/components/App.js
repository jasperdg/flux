import React, { Component } from 'react';
import Markets from './Markets';
import '../styles/App.css';
import Header from './Header';
import SplashScreen from './SplashScreen';
import BN from 'bn.js';

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
    accountState: null,
    // loading: true
  }

  async componentDidMount() {
    const near = await window.nearlib.connect(Object.assign({ deps: { keyStore: new window.nearlib.keyStores.BrowserLocalStorageKeyStore() } }, window.nearConfig));
    const walletAccount = new window.nearlib.WalletAccount(near);
    const accountId = walletAccount.getAccountId();
    const isSignedIn = walletAccount.isSignedIn();
    const contract = await near.loadContract(window.nearConfig.contractName, {
      viewMethods: ["get_all_markets", "get_market", "get_market_order"],
      changeMethods: ["create_market", "delete_market", "place_order", "resolute_market", "claim_earnings"],
      sender: accountId,
    });

    let account = null;
    let accountState = null;

    if (isSignedIn) {
      account = await near.account(walletAccount.getAccountId());
      accountState = await account.state();
    }
    
    const markets = await contract.get_all_markets();

    this.setState({
      near,
      walletAccount,
      accountId,
      contract,
      isSignedIn,
      markets,
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

  // TODO: Create wrapper contract for all contract methods,
  createMarket = async () => {
    await this.state.account.functionCall(
      window.nearConfig.contractName,
      "create_market",
      {
        outcomes: 2,
        description: "will x happen by T", 
        end_time: new Date().getTime() + 120000000
      },
      95344531,
    );
    this.getAndUpdateMarkets();
  }

  deleteMarket = async (id) => {
    await this.state.account.functionCall(
      window.nearConfig.contractName,
      "delete_market",
      {id},
      95344531
    );
    this.getAndUpdateMarkets();
  }


  placeOrder = async (marketId, outcome, amount, price) => {
    console.log(marketId, outcome, amount, price);
    const res = await this.state.account.functionCall(
      window.nearConfig.contractName, 
      "place_order", 
      {
        market_id: marketId, 
        outcome: outcome, 
        amount: amount, 
        price: price
      },
      95344531,
      new BN(amount * price)
    );
    this.getAndUpdateMarkets();
    console.log(res);
  }

  resoluteMarket = async (marketId, payout, invalid) => {
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

  claimEarnings = async (marketId) => {
    const res = await this.state.account.functionCall(
      window.nearConfig.contractName, 
      "claim_earnings", 
      {
        market_id: marketId
      },
      95344531
    );
    console.log("RESPONSE:" , atob(res.transactions[1].result.result));
  }

  getMarketOrder = (marketId, outcome) => {
    return new Promise( async (resolve, reject) => {
      try {
        const res = await this.state.contract.get_market_order({ market_id: marketId, outcome: outcome });
        resolve(res);
      } 
      catch {
        console.log("no market orders");
        resolve(null);
      }
    });
  }


  render() {

    return (
      <div className="App">

        {this.state.loading && <SplashScreen />}
        <Header
          createMarket={this.createMarket}
          account={this.state.account}
          accountState={this.state.accountState}
          isSignedIn={this.state.isSignedIn} 
          walletAccount={this.state.walletAccount}
        />
        {
          this.state.showMarkets 
          ? 
          <Markets 
          getMarketOrder={this.getMarketOrder}
          resolute={this.resoluteMarket}
          claimEarnings={this.claimEarnings}
          placeOrder={this.placeOrder} 
          deleteMarket={this.deleteMarket} 
          markets={this.state.markets}/> 
          : null
        }
      </div>
    );
  }
}

export default App;
