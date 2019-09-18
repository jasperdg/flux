import React from 'react';
import '../styles/landingPage.css';
import fluxLogo from '../assets/flux-logo.png';

function LandingPage(props) {

	return (
	  <div id="splash-screen">
		  <img src={fluxLogo} alt="flux's logo"/>
		  <h2>Stay tuned 🤫</h2>
	  </div>
	);

}


export default LandingPage;
