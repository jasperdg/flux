import React, { Component } from 'react';
import styled from 'styled-components';
import { validateEmail } from '../../utils/utils';
import { API_URL } from '../../constants';
import Recaptcha from 'react-google-invisible-recaptcha';

const EmailInput = styled.input`
	display: block;
	margin: auto;
	font-size: 18px;
	padding: 10px;
`;

const SubscripionContainer = styled.div`
	display: block; 
	margin: auto;
	width: 50%;
`;

const ResText = styled.p`
	text-align: center;
`

const Error = styled(ResText)`
	color: red;
`;

const Success = styled(ResText)`
	color: green;
`;

class EmailSignup extends Component {
	inputField = React.createRef();
	
	state = {
		newsletterOptIn: false,
		emailAddress: "",
		error: "",
		success: ""
	}

	handleSubscriptionToggle = e => {
		this.setState({newsletterOptIn: !this.state.newsletterOptIn});
	}
	
	handleEmailChange = e => {
		this.setState({emailAddress: e.target.value});
	}

	resetResMessage = () => {
		this.setState({
			error: "",
			success: ""
		})
	}

	onEmailSubmit = e => {
		e.preventDefault();
		this.resetResMessage();
		const { emailAddress } = this.state;

		const validEmail = validateEmail(emailAddress);
		
		if (!validEmail){ 
			this.recaptcha.reset();
			return this.setState({error: "Invalid email address provided"})
		};

		this.recaptcha.execute();

	}

	onRecaptchaResolved = async (recaptchaToken) => {
		const { newsletterOptIn, emailAddress } = this.state;
		const res = await fetch(`${API_URL}/add_email`, {
			method: "POST",
			mode: 'cors',
			cache: 'no-cache',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				emailAddress,
				newsletterOptIn,
				recaptchaToken
			})
		});
		const { err } = await res.json();

		this.recaptcha.reset();
		if (err) return this.setState({error: err}) // TODO: display error;
		else return this.setState({success: "success"}) // TODO: Display success;
	}
	

	render() {
		return (
			<form onSubmit={e => this.onEmailSubmit(e)}>
				<EmailInput value={this.state.emailAddress} onChange={e => this.handleEmailChange(e)} placeholder="me@example.com" type="text"/>
	
				<Recaptcha
					ref={ ref => this.recaptcha = ref }
					sitekey={ "6LcT7L4UAAAAANjtaNvX-Lr2Xyz8_ZZZJbUMzYQX" }
					onResolved={recaptchaToken => this.onRecaptchaResolved(recaptchaToken) } 
				/>
				<SubscripionContainer onClick={e => this.handleSubscriptionToggle(e)}>
					<input readOnly checked={this.state.newsletterOptIn} type="checkbox"/>
					<label >I want to stay up-to-date by subscribing to the Flux newsletter</label>
				</SubscripionContainer>
				<Error>{this.state.error}</Error>
				<Success>{this.state.success}</Success>
			</form>
		);
	}
}

export default EmailSignup;