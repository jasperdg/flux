import React from 'react';
import '../styles/header.css';
import fluxLogo from '../assets/flux-logo.png';

function Header(props) {
	const { startLoader, endLoader, getAndUpdateMarkets } = props;
	const { deleteMarket, accountState, account, walletAccount, createMarket, isSignedIn, accountId } = props.fluxProtocol;
	function signIn() {
		walletAccount.requestSignIn(
			window.nearConfig.contractName,
			window.nearConfig.contractName,
		);
  	}
  
	function signOut() {
		walletAccount.signOut();
   		window.location.replace(window.location.origin + window.location.pathname);
	}
	
	function toDollars(num) {
		return `$${(num / 10 ** 6).toFixed(2)}`
	}

	async function addMarket() {
		startLoader();
		const success = await createMarket();
		endLoader(success);
		getAndUpdateMarkets();
	}
  
	return (
		<header className="App-header">
		  <img onClick={addMarket} id="header-logo" src={fluxLogo} alt="our company logo"/>
		  {
				isSignedIn === false 	
				? 
			  <button onClick={signIn} className="login-button">Login</button>
				: (
					<>
						<div className="account-info">
						<span className="balance" onClick={
							async () => {
								await deleteMarket(0);
								getAndUpdateMarkets();
							}
						} className="account-id">{accountId}</span>
						<span >{account ? `${accountState && toDollars(accountState.amount)}` : null}</span>
						</div>
						<button onClick={signOut} className="login-button">Logout</button>
					</>
				)
		  }

		</header>
	);

}


export default Header;
