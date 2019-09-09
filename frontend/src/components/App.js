import React, { Component } from 'react';
import '../styles/App.css';

class App extends Component {
  state = {
    near: null,
    walletAccount: null,
    accountId: null,
    contract: null,
    isSignedIn: null
  }
  async componentDidMount() {

    const near = await window.nearlib.connect(Object.assign({ deps: { keyStore: new window.nearlib.keyStores.BrowserLocalStorageKeyStore() } }, window.nearConfig));
    const walletAccount = new window.nearlib.WalletAccount(near);
    const accountId = walletAccount.getAccountId();
    const contract = await near.loadContract(window.nearConfig.contractName, {
      // NOTE: This configuration only needed while NEAR is still in development
      // View methods are read only. They don't modify the state, but usually return some value.
      viewMethods: ["get_all_markets", "get_market"],
      // Change methods can modify the state. But you don't receive the returned value when called.
      changeMethods: ["create_market"],
      // Sender is the account ID to initialize transactions.
      sender: accountId,
    });

    const isSignedIn = walletAccount.isSignedIn();
    console.log(isSignedIn);
    if (!isSignedIn) {
      walletAccount.requestSignIn(
        // The contract name that would be authorized to be called by the user's account.
        window.nearConfig.contractName,
        // This is the app name. It can be anything.
        'Flux protocol',
        // We can also provide URLs to redirect on success and failure.
        // The current URL is used by default.
      );
    }
    this.setState({
      near,
      walletAccount,
      accountId,
      contract,
      isSignedIn
    })
  }


  render() {
    return (
      <div className="App">
        <header className="App-header">
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    );
  }
}

export default App;
