import React from 'react';
import styled from 'styled-components';
import Header from './Header';
import Title from './Title';
import BottomSection from './BottomSection';
import Demo from './Demo';
import BackgroundIcons from './BackgroundIcons';
import backgroundWave from './../../assets/background-wave.png';
import mediaQuery from '../../mediaQuery';

const Background = styled.div`
	height: 100vh;
	width: 45%;
	position: absolute;
	right: 0;
	top: 0;
	background-color: #DFDFFE;
	z-index: 0;
	overflow: hidden;

	${mediaQuery.mobile`
		position: relative;
		background-color: #0C004F;
		height: auto;
		width: 100%;
	`}
`;

const BackgroundWave = styled.img`
	height: 90%;
	position: absolute;
	bottom: 0;
	left: 0;
	z-index: 1;

	${mediaQuery.mobile`
		display: none;
	`}
`

const LandingPageContainer = styled.div`
	background-color: white;
	position: relative;
	width: 100%;
	height: 100vh;
	z-index: 1;

	${mediaQuery.mobile`
		overflow-y: scroll;
	`}
`;

const Content = styled.div`
	position: relative;
	z-index: 2;
`;

function LandingPage() {

	return (
	  <LandingPageContainer>
			<BackgroundIcons/>
			<Background className="background">
				<BackgroundWave src={backgroundWave}/>
			</Background>
			<Content>
				<Header/>
				<Demo/>
				<Title/>
		</Content>
		<BottomSection/>
	  </LandingPageContainer>
	);

}


export default LandingPage;
