import React from 'react';
import styled from 'styled-components';
import logo from './../../assets/flux-logo-text.png';
import twitterIcon from './../../assets/social-icon-twitter.png';
import mediumIcon from './../../assets/social-icon-medium.png';
import discordIcon from './../../assets/social-icon-discord.png';
import mediaQuery from '../../mediaQuery';

const Header = styled.div`
	width: 100%;
	display: flex;
	padding: 2% 5%;
	justify-content: space-between;
	box-sizing: border-box;
		
	${mediaQuery.mobile`
		padding: 5%;
	`}
`;

const Logo = styled.img`
	display: block;
	align-self: flex-start;
	min-width: 105px;
	width: 10%;
		
	${mediaQuery.mobile`
		align-self: top;
	`}
`;

const SocialWrapper = styled.div`
	min-width: 160px;
	width: 13%;
	display: flex;
	justify-content: space-between;
	
	${mediaQuery.mobile`
		min-width: 30px;
		width: 20px;
		flex-wrap: wrap;
	`}
`;

const SocialIcon = styled.img`
	width: 22%;
	align-self: center;
	cursor: pointer;
	
	${mediaQuery.mobile`
		width: 100%;
		margin-bottom: 13px;
	`}

`;

const header = () =>  (
	<Header>
		<Logo src={logo} alt="flux's logo"/>
		<SocialWrapper>
			<SocialIcon onClick={() => window.open("https://twitter.com/Flux_Market")} src={twitterIcon}/>
			<SocialIcon onClick={() => window.open("https://discord.gg/eg23nNx")} src={discordIcon}/>
			<SocialIcon onClick={() => window.open("https://medium.com/@fluxmarket")} src={mediumIcon}/>
		</SocialWrapper>
	</Header>
)

export default header;