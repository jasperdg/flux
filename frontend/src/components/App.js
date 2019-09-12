import React, { Component } from 'react';
import Markets from './Markets';
import '../styles/App.css';
import fluxLogo from '../assets/flux-logo.png';
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
    // loading: true
  }

  async componentDidMount() {
    const near = await window.nearlib.connect(Object.assign({ deps: { keyStore: new window.nearlib.keyStores.BrowserLocalStorageKeyStore() } }, window.nearConfig));
    const walletAccount = new window.nearlib.WalletAccount(near);

    const accountId = walletAccount.getAccountId();
    const isSignedIn = walletAccount.isSignedIn();
    const contract = await near.loadContract(window.nearConfig.contractName, {
      viewMethods: ["get_all_markets", "get_market"],
      changeMethods: ["create_market", "delete_market", "place_order"],
      sender: accountId,
    });

    const markets = await contract.get_all_markets();

    this.setState({
      near,
      walletAccount,
      accountId,
      contract,
      isSignedIn,
      markets,
    });

    setTimeout(() => {
      this.setState({loading: false});
    }, 2000)
  }

  getAndUpdateMarkets = async () => {
    const markets = await this.state.contract.get_all_markets();
    this.setState({markets});
  }


  deleteMarket = async (id) => {
    await this.state.contract.delete_market({id: id});
    this.getAndUpdateMarkets();
  }

  placeOrder = async (marketId, outcome, amount, price) => {
    console.log(this.state.contract);
    await this.state.contract.place_order({market_id: 0, outcome: 0, amount: 100000, price: 50}, {deposit: 5000000000000000000000000000})
    this.getAndUpdateMarkets();
  }

  createNewMarket = async () => {
    const res = await this.state.contract.create_market({outcomes: 2,description: "will x happen by T", end_time: 123412341234});
    this.getAndUpdateMarkets();

  }

  render() {
    return (
      <div className="App">
        {this.state.loading && <SplashScreen />}
        <Header accountId={this.state.accountId} isSignedIn={this.state.isSignedIn} walletAccount={this.state.walletAccount}/>
        {this.state.showMarkets ? <Markets placeOrder={this.placeOrder} deleteMarket={this.deleteMarket} contract={this.state.contract} markets={this.state.markets}/> : null}
      </div>
    );
  }
}

export default App;
