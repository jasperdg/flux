import React from 'react';
import '../styles/header.css';
import fluxLogo from '../assets/flux-logo.png';

function Header(props) {

	function signIn() {
		props.walletAccount.requestSignIn(
			window.nearConfig.contractName,
			window.nearConfig.contractName,
		);
  	}
  
	function signOut() {
		props.walletAccount.signOut();
   	window.location.replace(window.location.origin + window.location.pathname);
	}
	
	function toDollars(num) {
		// return `$${(num / 10 ** 18).toFixed(2)}`
		return `$${(num / 10 ** 6).toFixed(2)}`
	}
  
	return (
		<header className="App-header">
		  <img onClick={props.createMarket} id="header-logo" src={fluxLogo} alt="our company logo"/>
		  {
			  props.isSignedIn === false 	? 
			  <button onClick={signIn} className="login-button">Login</button>
											:
			  (
          <>
            <div className="account-info">
            <span onClick={() => props.deleteMarket(0)} className="account-id">{props.account ? props.account.accountId : null}</span>
            <span className="balance">{props.account ? `${toDollars(props.accountState.amount)}` : null}</span>
            </div>
            <button onClick={signOut} className="login-button">Logout</button>
          </>
        )
		  }

		</header>
	);

}


export default Header;
