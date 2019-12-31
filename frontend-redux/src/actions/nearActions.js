export const INIT = "INIT";
export const GOT_OWNER = "GOT_OWNER";

export const init = (
	near,
	walletAccount,
	contract
) => ({
	type: INIT,
	payload: {
		near,
		walletAccount,
		contract
	}
});

const gotOwner = owner => ({
	type: GOT_OWNER,
	payload: {
		owner
	}
})

export const initialize = () => {
	return async dispatch => {
		const near = await window.nearlib.connect(Object.assign({ deps: { keyStore: new window.nearlib.keyStores.BrowserLocalStorageKeyStore() } }, window.nearConfig));
		const walletAccount = new window.nearlib.WalletAccount(near);
		console.log(walletAccount)
		const accountId = walletAccount.getAccountId();
		const contract = await near.loadContract(window.nearConfig.contractName, {
			viewMethods: ["get_all_markets", "get_market", "get_market_order", "get_owner", "get_earnings", "get_open_orders", "get_filled_orders"],
			changeMethods: ["create_market", "delete_market", "place_order", "claim_earnings", "resolute_market"],
			sender: accountId,
		});

		dispatch(init (
			near,
			walletAccount,
			contract, 
		))

		const contractOwner = await contract.get_owner();

		dispatch(gotOwner(contractOwner))

		
		return true;
	}
}
