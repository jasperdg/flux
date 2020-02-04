import React from 'react';
import styled from 'styled-components';
import mediaQuery from '../../mediaQuery';
import backgroundCircleFill from './../../assets/background-circle-fill.png';
import backgroundCircleTransperant from './../../assets/background-circle-transperant.png';
import backgroundCross from './../../assets/background-cross.png';
import backgroundFluxBlur from './../../assets/background-flux-blur.png';

const BackgroundIcon = styled.div`
	background-size: cover;
	position: absolute;
	opacity: 0.8;

	${mediaQuery.mobile`
		opacity: 0.6;
		z-index: 0!important;
	`}
`;

const CircleTransperant = styled(BackgroundIcon)`
	background-image: url(${backgroundCircleTransperant});
	width: 16px;
	height: 16px;
	left: 5.5%;
	top: 24%;
`;

const FluxIconBlur = styled(BackgroundIcon)`
	background-image: url(${backgroundFluxBlur});
	width: 30px;
	height: 30px;
	left: 6.5%;
	top: 26.5%;
	${mediaQuery.mobile`
		top: 45%;
	`}
`;

const FluxIconCross = styled(BackgroundIcon)`
	background-image: url(${backgroundCross});
	width: 19px;
	height: 19px;
	left: 22.5%;
	top: 71%;
`;

const CircleFill = styled(BackgroundIcon)`
	background-image: url(${backgroundCircleFill});
	width: 18px;
	height: 18px;
	left: 39%;
	top: 12%;
`;

const CircleFillTwo = styled(CircleFill)`
	width: 25px;
	height: 25px;
	left: 39%;
	top: 67%;
`;

const CircleFillThree = styled(CircleFillTwo)`
	left: 80%;
	top: 55%;
	z-index: 4;
`;

const CircleFillFour = styled(CircleFill)`
	left: 82%;
	top: 18%;
	z-index: 4;
`;

const FluxIconMirror = styled(BackgroundIcon)`
	background-image: url(${backgroundFluxBlur});
	width: 30px;
	height: 30px;
	right: 28%;
	top: 25%;
	transform: scale(1, -1);
	z-index: 4;
`;

export default () => (
	<>
		<CircleFill/>
		<CircleFillTwo/>
		<CircleFillThree/>
		<CircleFillFour/>
		<CircleTransperant/>
		<FluxIconCross/>
		<FluxIconBlur/>
		<FluxIconMirror/>
	</>
)