import React, { Component } from 'react';
import Markets from './Markets';
import '../styles/App.css';
class App extends Component {
  state = {
    near: null,
    walletAccount: null,
    accountId: null,
    contract: null,
    isSignedIn: null,
    markets: [],
    showMarkets: true,
  }

  async componentDidMount() {
    const near = await window.nearlib.connect(Object.assign({ deps: { keyStore: new window.nearlib.keyStores.BrowserLocalStorageKeyStore() } }, window.nearConfig));
    const walletAccount = new window.nearlib.WalletAccount(near);
    const accountId = walletAccount.getAccountId();
    const isSignedIn = walletAccount.isSignedIn();
    const contract = await near.loadContract(window.nearConfig.contractName, {
      viewMethods: ["get_all_markets", "get_market"],
      changeMethods: ["create_market", "delete_market"],
      sender: accountId,
    });

    if (!isSignedIn) {
      walletAccount.requestSignIn(
        window.nearConfig.contractName,
        'flux_protocol',
      );
    }

    const markets = await contract.get_all_markets();

    this.setState({
      near,
      walletAccount,
      accountId,
      contract,
      isSignedIn,
      markets
    });
  }

  getAndUpdateMarkets = async () => {
    const markets = await this.state.contract.get_all_markets();
    this.setState({markets});
  }


  deleteMarket = async (id) => {
    const success = await this.state.contract.delete_market({id: id});
    this.getAndUpdateMarkets();
  }

  createNewMarket = async () => {
    const res = await this.state.contract.create_market({outcomes: 2,description: "will x happen by T", end_time: 123412341234});
    this.getAndUpdateMarkets();

  }
  

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <button onClick={this.createNewMarket}>Create market</button>
          <button onClick={() => {this.setState({showMarkets: true})}}>Show markets</button>
        </header>
        {this.state.showMarkets ? <Markets deleteMarket={this.deleteMarket} markets={this.state.markets}/> : null}
      </div>
    );
  }
}

export default App;
