import React from 'react';
import styled from 'styled-components';
import Spinner from './Spinner';
import Modal from './Modal';

const StyledSpinner = styled(Spinner) `
	left: calc(50% - 32px);
	top: 15%;
`;

const Text = styled.div`
	text-align: center;
	width: 100%;
	display: block;
`;

const ResText = styled(Text)`
	text-align: center;
	margin-top: 38px;
`;

const LoadingText = styled(Text)`
	position: absolute;
	left: 0;
	bottom: 10%;
`;

function Loader(props) {

	return (
	  props.isActive && <Modal>
		  {props.txRes !== null 
			  ? 
			  <ResText className="res">{props.txRes === true ? "success" : "failed" }</ResText>
			  : 
			  (
				  <>
					  <StyledSpinner />
					  <LoadingText className="loading text">processing</LoadingText>
				  </>
			  )
		  }
	  </Modal>
		  	
		  
	);

}


export default Loader;
