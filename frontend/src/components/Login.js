
import React, { Component } from 'react';

class Login extends Component {
	state = { 
		accountId: ""
	}

	currentUrl = window.location.href;

	done () {
		const { currentUrl } = this;
		const successUrl = new URL(currentUrl.searchParams.get('success_url'));
		successUrl.searchParams.set('account_id', document.getElementById('accountId').value);
		successUrl.searchParams.set('public_key', currentUrl.searchParams.get('public_key'));
		window.location.assign(successUrl.toString());
	}
	render() {
		const { currentUrl } = this;
		const message = `NODE_ENV=local near create_account {newAccountId} --masterAccount {masterAccountId} --publicKey ${currentUrl.searchParams.get('public_key')} --initialAmount 10000000000000000000`;

		return(
			<body style="background: #fff; margin-top: 3em">
			<div>Please run the following command in shell, then enter account id here. masterAccountId default: test.near
			</div>
			<div>
				<code id="shell-command">{message}</code>
			</div>
			<input type="text" value={this.state.accountId} onChange={(e) => {this.setState({accountId: e.value})}} id="accountId" name="accountId" placeholder="Account id"></input>
			<button type="button" onClick="done()">done</button>

			</body>
		);
	}
}


export default Login; 