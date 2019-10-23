import React from 'react';
import fluxLogo from '../assets/flux-logo.png';
import styled from 'styled-components';

const Logo = styled.img`
	width: 15%;
	display: inline-block;
	align-self: center;
`

const HeaderContainer = styled.header`
	display: flex;
	justify-content: space-between;
	vertical-align: middle;
	align-items: center;
	padding: 3% 5% ;
`

const LoginButton = styled.button`
	align-self: center;
	color: white;
	background-color: #FF009C;
	font-family: "Gilroy";
	border: none;
	border-radius: 6px;
	padding: 8px 15px;
	font-size: 18px;
`

const AccountInfoContainer = styled.div`
	width: 40%;
	font-family: "Lato-bold";
	line-height: 140%;
`

const AccountInfo = styled.span`
	display: block;
	text-align: center;
`

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
		<HeaderContainer>
		  <Logo onClick={addMarket} id="header-logo" src={fluxLogo} alt="our company logo"/>
		  {
				isSignedIn() === false 	
				? 
			  <LoginButton onClick={signIn} >Login</LoginButton>
				: (
					<>
						<AccountInfoContainer>
							<AccountInfo onClick={
								async () => {
									await deleteMarket(0);
									getAndUpdateMarkets();
								}
							} >{accountId}</AccountInfo>
							<AccountInfo >{account ? `${accountState && toDollars(accountState.amount)}` : null}</AccountInfo>
						</AccountInfoContainer>
						<LoginButton onClick={signOut}>Logout</LoginButton>
					</>
				)
		  }

		</HeaderContainer>
	);

}


export default Header;
