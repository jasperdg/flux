import React from 'react';
import '../styles/loader.css';

function Loader(props) {

	return (
	  <div id="loader">
		  <div className="blackground" />
		  <div className="modal">
		  	
			{props.txRes !== null 
				? 
				<div className="res">{props.txRes === true ? "success" : "failed" }</div>
				: 
				(
					<>
		  			<div className="lds-ripple"><div></div><div></div></div>
					<div className="loading text">processing</div>
					</>
				)
			}
		  </div>
		  
	  </div>
	);

}


export default Loader;
