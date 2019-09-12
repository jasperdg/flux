import React from 'react';
import '../styles/splashScreen.css';
import fluxLogo from '../assets/flux-logo.png';

function SplashScreen(props) {

	return (
	  <div id="splash-screen">
		  <img src={fluxLogo} alt="flux's logo"/>
		  <h2>markets reimagined.</h2>
		  <div className="lds-ripple"><div></div><div></div></div>
	  </div>
	);

}


export default SplashScreen;
