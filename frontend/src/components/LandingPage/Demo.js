import React from 'react';
import styled from 'styled-components';
import mobile from './../../assets/mobile-demo.png';
import mediaQuery from '../../mediaQuery';

const Demo = styled.img`
	height: 60vh;
	left: 40%;
	position: absolute;
	box-shadow: none;
  transform: rotate(45deg); /* Equal to rotateZ(45deg) */
	animation: float 6s ease-in-out infinite;
			
	${mediaQuery.mobile`
		display: none;
	`}

	@keyframes float {
		0% {
			transform: translatey(0px);

		}
		50% {
			transform: translatey(-20px);

		}
		100% {
			transform: translatey(0px);

		}
	}


`;

export default () => <Demo src={mobile}/>
