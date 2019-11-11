import BN from 'bn.js';

export default class FluxProtocolWrapper {

	init = () => {
		return new Promise(async (resolve, reject) => {
			this.near = await window.nearlib.connect(Object.assign({ deps: { keyStore: new window.nearlib.keyStores.BrowserLocalStorageKeyStore() } }, window.nearConfig));
			this.walletAccount = new window.nearlib.WalletAccount(this.near);
		
			this.accountId = this.walletAccount.getAccountId();
			this.contract = await this.near.loadContract(window.nearConfig.contractName, {
			  viewMethods: ["get_all_markets", "get_market", "get_market_order", "get_sender", "get_owner", "get_earnings"],
			  changeMethods: ["create_market", "delete_market", "place_order", "resolute_market", "claim_earnings"],
			  sender: this.accountId,
			});

			this.account = null;
			this.accountState = null;
			this.allowance = null;
			this.isOwner = (await this.contract.get_owner()) == this.accountId;
			
			if (this.isSignedIn()) {
				this.account = await this.near.account(this.walletAccount.getAccountId()); 
				this.accountState = await this.account.state();
			  this.allowance = this.account._accessKey.permission.FunctionCall.allowance;
			}
			resolve(this);
		});
	}

	isSignedIn = () => this.walletAccount ? this.walletAccount.isSignedIn() : false;
	
	getEarningsAmount = (marketId) => new Promise( async (resolve, reject) => {
		try {
			const res = await this.contract.get_earnings({market_id: marketId, from: this.accountId})
			return resolve(res);
		} catch (err) {
			return resolve(0);
		}
	});
	

	getMarkets = () => {
		return new Promise( async (resolve) => {
			resolve(await this.contract.get_all_markets());
		});
	}

	getAccount = () => {
		return new Promise( async (resolve) => {
			resolve(await this.near.account(this.accountId));
		});
	}

	getAccountState = () => {
		return new Promise( async (resolve) => {
			resolve(await this.account.state());
		});
	}

	getAndSetBalance = () => {
		return new Promise( async (resolve) => {
			if (this.isSignedIn()) {
			  this.account = await this.near.account(this.walletAccount.getAccountId()); 
				this.accountState = await this.account.state();
				this.allowance = this.account._accessKey.permission.FunctionCall.allowance;
				resolve(true);
			}	else {
				resolve(false);
			}
		});
	}

	createMarket = (description, endTime) => {
		return new Promise( async (resolve, reject) => {
			try {
				if (description.length < 1) return resolve(false);
				if (endTime < new Date().getTime()) return resolve(false);
				console.log(description, endTime)
				await this.account.functionCall(
					window.nearConfig.contractName,
					"create_market",
					{
						outcomes: 2,
						description: description ,
						end_time: endTime
					},
					5344531,
				);
				return resolve(true);
			}
			catch(err) {
				console.log(err);
				return resolve(err);
			}
		});
	}

	deleteMarket = (id) => {
		return new Promise( async (resolve, reject) => {
			const success = await this.account.functionCall(
			window.nearConfig.contractName,
			"delete_market",
			{id},
			5344531
			);
			resolve(success);
		});
	}
	// Purchasing:  333333  shares for:  9999990
	// Purchasing:  142857  shares for:  9999990
	placeOrder = (marketId, outcome, spend, pricePerShare) => {
		console.log("Spending: ", spend, " shares for: ", spend / pricePerShare);

		return new Promise( async (resolve, reject) => {
		  try {
				await this.account.functionCall(
					window.nearConfig.contractName, 
					"place_order", 
					{
					from: this.accountId,
					market_id: marketId, 
					outcome: outcome, 
					amount: spend, 
					price: pricePerShare
					},
					1344531,
					new BN(spend * pricePerShare)
				);
				await this.getAndSetBalance();

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
					payout,
					invalid
				},
				5344531
			);
			resolve(true);
		});
	}
	
	claimEarnings = (marketId) => {
		return new Promise( async (resolve) => {
			try {
				const res = await this.account.functionCall(
				window.nearConfig.contractName, 
				"claim_earnings", 
				{
					market_id: marketId,
					_for: this.accountId
				},
				5344531
				);
				resolve(res);
			}
			catch {
				resolve(false);
			}
		});
		
	}
	
	getMarketOrder = (marketId, outcome) => {
		return new Promise( async (resolve) => {
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