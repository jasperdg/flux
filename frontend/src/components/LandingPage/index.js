import React from 'react';
import fluxLogo from '../../assets/flux-logo.png';
import styled from 'styled-components';
import EmailSignup from './EmailSignup';

const Title = styled.h2 `
	text-align: center;
	color: #310094;
`

const Logo = styled.img `
	width: 50%;
	max-width: 250px;
	margin: auto;
	display: block;
	margin-top: 30vh;
`
function LandingPage(props) {

	return (
	  <div id="landing-page">
		  <Logo src={fluxLogo} alt="flux's logo"/>
		  <Title>Stay tuned 🤫</Title>
			<EmailSignup/>
	  </div>
	);

}


export default LandingPage;
