import BN from 'bn.js';
export const PLACED_ORDER = "PLACED_ORDER";
export const START_ORDER_PLACE = "START_ORDER_PLACE";

export const placedOrder = result => ({
	type: PLACED_ORDER,
	payload: {result}
})

export const startOrderPlace = () => ({
	type: START_ORDER_PLACE,
})

export const placeOrder = (contract, account, accountId ,marketId, outcome, order) => {
	return dispatch => {
		const spend = order.spend * (10 ** 6);
		console.log(spend);
		dispatch(startOrderPlace());
				console.log({contract, account, accountId ,marketId, outcome, order})
		account.functionCall(
			window.nearConfig.contractName, 
			"place_order", 
			{
				from: accountId,
				market_id: marketId,
				outcome: outcome,
				spend,
				price_per_share: order.odds
			},
			new BN("100000000000000"),
			new BN(spend)
		);
	}
}

export const claimEarnings = (contract, account, accountId ,marketId, outcome, order) => {
	return dispatch => {
		const spend = order.spend * (10 ** 6);
		console.log(spend);
		dispatch(startOrderPlace());
				console.log({contract, account, accountId ,marketId, outcome, order})
		account.functionCall(
			window.nearConfig.contractName, 
			"place_order", 
			{
				from: accountId,
				market_id: marketId,
				outcome: outcome,
				spend,
				price_per_share: order.odds
			},
			new BN("100000000000000"),
			new BN(spend)
		);
	}
}