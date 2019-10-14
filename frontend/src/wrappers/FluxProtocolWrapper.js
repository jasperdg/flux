import BN from 'bn.js';

export default class FluxProtocolWrapper {
	init = () => {
		return new Promise(async (resolve, reject) => {
			this.near = await window.nearlib.connect(Object.assign({ deps: { keyStore: new window.nearlib.keyStores.BrowserLocalStorageKeyStore() } }, window.nearConfig));
			this.walletAccount = new window.nearlib.WalletAccount(this.near);
		
			this.accountId = this.walletAccount.getAccountId();
			this.isSignedIn = this.walletAccount.isSignedIn();
			this.contract = await this.near.loadContract(window.nearConfig.contractName, {
			  viewMethods: ["get_all_markets", "get_market", "get_market_order", "get_sender"],
			  changeMethods: ["create_market", "delete_market", "place_order", "resolute_market", "claim_earnings"],
			  sender: this.accountId,
			});
		
			this.account = null;
			this.accountState = null;
			this.allowance = null;
			
			if (this.isSignedIn) {
			  this.account = await this.near.account(this.walletAccount.getAccountId()); 
				this.accountState = await this.account.state();
			  this.allowance = this.account._accessKey.permission.FunctionCall.allowance;
			}
			resolve(this);
		});
	}

	getMarkets = () => {
		return new Promise( async (resolve, reject) => {
			resolve(await this.contract.get_all_markets());
		});
		
	}

	getAccount = () => {
		return new Promise( async (resolve, reject) => {
			resolve(await this.near.account(this.accountId));
		});
	}

	getAccountState = () => {
		return new Promise( async (resolve, reject) => {
			resolve(await this.account.state());
		});
	}

	getBalance = () => {
		return new Promise( async (resolve, reject) => {
			resolve(await this.account._accessKey.permission.FunctionCall.allowance);
		});
	}

	createMarket = (description) => {
		return new Promise( async (resolve, reject) => {
			try {
				await this.account.functionCall(
					window.nearConfig.contractName,
					"create_market",
					{
						outcomes: 2,
						description: description ? description : "will x happen by T",
						end_time: new Date().getTime() + 120000000
					},
					5344531,
				);
				resolve(true);
			}
			catch {
				resolve(false);
			}
		});
	}

	deleteMarket = (id) => {
		return new Promise( async (resolve, reject) => {
			await this.account.functionCall(
			window.nearConfig.contractName,
			"delete_market",
			{id},
			5344531
			);
			resolve(true);
		});
	}
	
	placeOrder = (marketId, outcome, amount, price) => {
		return new Promise( async (resolve, reject) => {
		  try {
				await this.account.functionCall(
					window.nearConfig.contractName, 
					"place_order", 
					{
					from: this.accountId,
					market_id: marketId, 
					outcome: outcome, 
					amount: amount, 
					price: price
					},
					1344531,
					new BN(amount * price)
				);
				resolve(true);
		  } 
		  catch {
				resolve(false);
		  }
		});
	}
	  
	resoluteMarket = (marketId, payout, invalid) => {
		return new Promise( async (resolve, reject) => {			
			await this.account.functionCall(
				window.nearConfig.contractName, 
				"resolute", 
				{
				market_id: marketId, 
				payout: [0, 10000],
				invalid: false
				},
				5344531
			);
			resolve(true);
		});
	}
	
	claimEarnings = (marketId) => {
		return new Promise( async (resolve, reject) => {
			try {
				await this.account.functionCall(
				window.nearConfig.contractName, 
				"claim_earnings", 
				{
					market_id: marketId,
					_for: this.accountId
				},
				5344531
				);
				resolve(true);
			}
			catch {
				resolve(false);
			}
		});
		
	}
	
	getMarketOrder = (marketId, outcome) => {
		return new Promise( async (resolve, reject) => {
		  try {
				const res = await this.contract.get_market_order({ market_id: marketId, outcome: outcome });
				resolve(res);
		  } 
		  catch {
				resolve(0);
		  }
		});
	}
}