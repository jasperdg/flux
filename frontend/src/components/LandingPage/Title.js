import React from 'react'
import styled from 'styled-components';
import mediaQuery from '../../mediaQuery';

const TitleSection = styled.div`
	position: absolute;
	left: 10%;
	top: 220%;
	${mediaQuery.mobile`
		top: 20%;
		left: 5%;
		position: relative;
		height: auto;
		width: 95%;
	`}
`;

const Title = styled.h1`
	color: #230069;
	line-height: 100%;
	font-size: 54px;
	margin-bottom: 5%;
	${mediaQuery.mobile`
		// margin-bottom: 3%;
		margin: 0 auto;
		position: relative;
		z-index: 6;

	`}
`;

const SubTitle = styled.p`
	color: #310094;
	font-size: 24px;
	margin: 0;
	
`;

export default () => (
	<TitleSection>
		<Title>markets <br/> reimagined.</Title>
		<SubTitle>A highly scalable open market protocol</SubTitle>
	</TitleSection>
)