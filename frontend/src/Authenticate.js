import React, {Component} from 'react';
import LandingPage from './components/LandingPage/index';

class Authenticate extends Component {
	constructor(props) {
		super(props)
		this.state = { 
			redirect: false, 
			auth: false
		}
	}

	render () {
		return(
			<LandingPage/>
		)
	}
}

export default Authenticate;