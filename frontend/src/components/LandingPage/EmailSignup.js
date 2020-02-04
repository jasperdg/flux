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
		width: 100%;
		margin-top: 0;

		margin-bottom: 12%;
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
		width: calc(100% - 20px);
		max-width: 425px;
		margin-bottom: 4%;

	`}
`;

const SignupButton = styled.button`
	width: calc(28%);
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
		width: 100%;
	`}
`;

const Small = styled.small`
	color: white;
	display: block;
	position: relative;
	margin: auto;
	margin-top: 15px;
	opacity: 0.7;
	& a {
		color: white;
		margin-left: 5px;
		margin-top: 5px;
	}

`

const ResText = styled.p`
	text-align: center;
`

const Error = styled(ResText)`
	color: red;
`;

const Success = styled(ResText)`
	color: #81c784;
`;

const SignupContainer = styled.form`
	width: 40%;

	& .grecaptcha-badge{
		visibility: hidden;
		opacity: 0;
	}

	${mediaQuery.mobile`
		width: 90%;
		padding: 5%;
		padding-top: 2%;
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
		let res;
		try {
			res = await fetch(`${API_URL}/add_user`, {
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
			if (err) return this.setState({error: err});
			else return this.setState({success: 'Get ready for fomo!'});
			
		} catch(err) {
			this.setState({error: "Server error: please try again later."});
		}
		
	}
	

	render() {
		return (
			<SignupContainer onSubmit={e => this.onEmailSubmit(e)}>

				<Title>Stay in the loop</Title>
				<InputSection>
					<EmailInput value={this.state.emailAddress} onChange={e => this.handleEmailChange(e)} placeholder="Your e-mail" type="text"/>
					<SignupButton>Sign up</SignupButton>
				</InputSection>
				<Recaptcha
					ref={ ref => this.recaptcha = ref }
					sitekey={ "6LcT7L4UAAAAANjtaNvX-Lr2Xyz8_ZZZJbUMzYQX" }
					onResolved={recaptchaToken => this.onRecaptchaResolved(recaptchaToken) } 
				/>
				<Small>
					<small>This site is protected by reCAPTCHA and the Google 
						<a href="https://policies.google.com/privacy">Privacy Policy</a> and
						<a href="https://policies.google.com/terms">Terms of Service</a> apply.
					</small>
				</Small>
				<Error>{this.state.error}</Error>
				<Success>{this.state.success}</Success>
			</SignupContainer>
		);
	}
}

export default EmailSignup;