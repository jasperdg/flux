import React, { Component } from 'react';
import Markets from './Markets';
import '../styles/App.css';
import Header from './Header';
import SplashScreen from './SplashScreen';
import LandingPage from './LandingPage';
import BN from 'bn.js';
import Loader from './Loader';
import { throws } from 'assert';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      near: null,
      walletAccount: null,
      accountId: null,
      contract: null,
      isSignedIn: null,
      markets: [],
      showMarkets: true,
      account: null,
      accountState: null,
      isRightUrl:false,
      txLoading: false,
      txRes: null
      // loading: true
    }
  }
  
  async componentDidMount() {
    console.log(window.location.origin);
    if (process.env.NODE_ENV === 'production' && window.location.origin === "https://demo.flux.market") {
      console.log("doing this");
      this.setState({isRightUrl: true});
    } else if(process.env.NODE_ENV === 'development'){
      this.setState({isRightUrl: true});
    }
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
    let contractState = null;
    if (isSignedIn) {
      account = await near.account(walletAccount.getAccountId());
      contractState = await near.account(window.nearConfig.contractName);
      accountState = await account.state();
    }
    
    console.log(contractState);

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

    setTimeout(() => {
      this.setState({loading: false});
    }, 2000)
  }

  startLoader = () => {
    this.setState({txLoading: true});
  }

  endLoader = (res) => {
    this.setState({txRes: res});
    setTimeout( () => this.setState({
      txLoading: false,
      txRes: null
    }), 1000)
  }

  getAndUpdateMarkets = async () => {
    const markets = await this.state.contract.get_all_markets();
    console.log(markets);
    this.setState({markets});
  }

  // TODO: Create wrapper contract for all contract methods,
  createMarket = async () => {
    this.startLoader();
    try{
      await this.state.account.functionCall(
        window.nearConfig.contractName,
        "create_market",
        {
          outcomes: 2,
          description: "will x happen by T", 
          end_time: new Date().getTime() + 120000000
        },
        5344531,
      );
      this.getAndUpdateMarkets();
      this.endLoader(true);
    } catch {
      this.endLoader(false);
    }
  }

  deleteMarket = async (id) => {
    await this.state.account.functionCall(
      window.nearConfig.contractName,
      "delete_market",
      {id},
      5344531
    );
    this.getAndUpdateMarkets();
  }


  placeOrder =  (marketId, outcome, amount, price) => {
    return new Promise( async (resolve, reject) => {
      this.startLoader();
      try {
        const res = await this.state.account.functionCall(
          window.nearConfig.contractName, 
          "place_order", 
          {
            market_id: marketId, 
            outcome: outcome, 
            amount: amount, 
            price: price
          },
          1344531,
          new BN(amount * price)
        );
        this.getAndUpdateMarkets();
        this.endLoader(true);
        resolve(res);
      } 
      catch {
        this.endLoader(false);
      }
    });
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
      5344531
    );
    console.log("RESPONSE:" , res)
  }

  claimEarnings = async (marketId) => {
    this.startLoader()
    try {
      const res = await this.state.account.functionCall(
        window.nearConfig.contractName, 
        "claim_earnings", 
        {
          market_id: marketId
        },
        5344531
      );
      this.endLoader(true);
    }
    catch {
      this.endLoader(false);
    }
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

        {this.state.isRightUrl ? 
          <>
          {this.state.txLoading && <Loader txRes={this.state.txRes}/>}
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
          </>
        : <LandingPage/> }
        
      </div>
    );
  }
}

export default App;
