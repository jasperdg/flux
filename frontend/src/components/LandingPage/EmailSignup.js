import React, { Component } from 'react';
import styled from 'styled-components';
import { validateEmail } from '../../utils/utils';
import { API_URL } from '../../constants';
import Recaptcha from 'react-google-invisible-recaptcha';
import mediaQuery from '../../mediaQuery';

const Title = styled.h1`
	color: white;
	line-height: 100%;
	font-size: 36px;
	width: 70%;
	${mediaQuery.mobile`
		margin: auto;
		text-align: center;
		margin-bottom: 7%;
	`}
`;

const InputSection = styled.div`
	display: flex;
	justify-content: space-between;
	${mediaQuery.mobile`
		display: block;
	`}
`;

const EmailInput = styled.input`
	display: inline-block;
	font-size: 14px;
	padding: 15px 10px;
	width: calc(70% - 20px);
	border-radius: 6px;
	border: none;
	${mediaQuery.mobile`
		margin: auto;
		display: block;
		width: 100%;
		max-width: 425px;
		margin-bottom: 4%;

	`}
`;

const SignupButton = styled.button`
	width: calc(38% - 50px);
	display: inline-block;
	color: white;
	font-size: 14px;
	padding: 15px 0;
	background-color: #FF009C;
	cursor: pointer;
	border: none;
	border-radius: 6px;

	${mediaQuery.mobile`
		display: block;
		margin: auto;
		max-width: 144px;
	`}
`;

const Label = styled.label`
	color: white;
`;

const SubscripionContainer = styled.div`
	display: block; 
	margin: auto;
	width: 100%;
	margin-top: 5px;

	${mediaQuery.mobile`
		display: block;
		margin: auto;
		width: 80%;
		margin-top: 2%;
		max-width: 200px;
	`}

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

const SignupContainer = styled.form`
	width: 40%;

	${mediaQuery.mobile`
		width: 90%;
		padding: 5%;
	`}
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
			<SignupContainer onSubmit={e => this.onEmailSubmit(e)}>

				<Title>Sign up for Early Access</Title>
				<InputSection>
					<EmailInput value={this.state.emailAddress} onChange={e => this.handleEmailChange(e)} placeholder="Your e-mail" type="text"/>
					<SignupButton>Fomo!</SignupButton>
				</InputSection>
				<Recaptcha
					ref={ ref => this.recaptcha = ref }
					sitekey={ "6LcT7L4UAAAAANjtaNvX-Lr2Xyz8_ZZZJbUMzYQX" }
					onResolved={recaptchaToken => this.onRecaptchaResolved(recaptchaToken) } 
				/>
				<SubscripionContainer onClick={e => this.handleSubscriptionToggle(e)}>
					<input readOnly checked={this.state.newsletterOptIn} type="checkbox"/>
					<Label >I want to stay up-to-date</Label>
				</SubscripionContainer>
				<Error>{this.state.error}</Error>
				<Success>{this.state.success}</Success>
			</SignupContainer>
		);
	}
}

export default EmailSignup;