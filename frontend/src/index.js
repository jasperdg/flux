import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter as Router, Route } from "react-router-dom";
import GlobalStyles from  "./global-styles";
import Authenticate from './Authenticate';


ReactDOM.render(
	<>
		<GlobalStyles/>
		<Router>
			<Route path="/redirect" component={() => window.location.href = "https://flux.market"}/>
			<Route exact path="/:accessToken?" component={Authenticate}/>
		</Router>
	</>
	, document.getElementById('root')
);

serviceWorker.register();