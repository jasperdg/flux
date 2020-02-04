import React from 'react';
import styled from 'styled-components';
import nearLogo from './../../assets/near-logo.svg';
import EmailSignup from './EmailSignup';
import mediaQuery from '../../mediaQuery';

const NearLogo = styled.img`
		height: 18px;
		vertical-align: middle;
		margin-left: 4px;
`;

const BottomSection = styled.div`
	position: absolute;
	bottom: 5%;
	left: 5%;
	width: 90%;
	display: flex;
	flex-direction: row-reverse;
	justify-content: space-between;

	${mediaQuery.mobile`
		flex-direction: row;
		flex-wrap: wrap;
		position: relative;
		background-color: #0C004F;
		height: auto;
		width: 100%;
		bottom: 0;
		left: 0;
		top: 10%;
		padding-top: 10%;
	`}
`;

const Footer = styled.div`
	opacity: 0.4;
	align-self: flex-end;
	padding-left: 5%;
	padding-bottom: 2.7%;
	cursor: pointer;

	${mediaQuery.mobile`
		display: block;
		opacity: 1;
		width: 100%;
		padding-left: 0;
		background-color: white;
		padding-top: 4.4%;
		text-align: center

	`}
`;

export default () => (
	<BottomSection>
		<EmailSignup/>
		<Footer onClick={() => window.open("https://nearprotocol.com/")}>Built on <NearLogo src={nearLogo}/></Footer>
	</BottomSection>

)
// 920
