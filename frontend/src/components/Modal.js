import React from 'react';
import styled from 'styled-components';


const ModalContainer = styled.div`
	background-color: white;
	width: 35%;
	position: absolute;
	left: calc(32.5% - 7.5px);
	top: 40%;
	border-radius: 6px;
	padding: 15px;
	height: 100px;
	/* position: relative; */
	z-index: 102;
`

const Blackground = styled.div`
	position: absolute;
	width: 100vw;
	height: 100vh;
	top: 0;
	left: 0;
	background-color: rgba(0, 0, 0, 0.3);
	z-index: 101;
`
function Modal({className, children}) {

	return (
		<Blackground >
			<ModalContainer className={className}>
			{children}
			</ModalContainer>
		</Blackground>
	);

}


export default Modal;
