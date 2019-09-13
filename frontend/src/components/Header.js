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
  
	return (
		<header className="App-header">
		  <img  id="header-logo" src={fluxLogo} alt="our company logo"/>
		  {
			  props.isSignedIn === false 	? 
			  <button onClick={signIn} className="login-button">Login</button>
			  							              :
			  (
          <>
            <div className="account-info">
            <span className="account-id">{props.accountId}</span>
            <span className="balance">Balance: {props.account ? props.account.amount : null}</span>
            </div>
            <button onClick={signOut} className="login-button">Logout</button>
          </>
        )
		  }

		</header>
	);

}


export default Header;
