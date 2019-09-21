import React from 'react';
import '../styles/landingPage.css';
import fluxLogo from '../assets/flux-logo.png';

function LandingPage(props) {

	return (
	  <div id="landing-page">
		  <img src={fluxLogo} alt="flux's logo"/>
		  <h2>Stay tuned 🤫</h2>
	  </div>
	);

}


export default LandingPage;
