import BN from 'bn.js';
import { dollarsToDai } from '../utils/unitConvertion';
export const PLACED_ORDER = "PLACED_ORDER";
export const START_ORDER_PLACE = "START_ORDER_PLACE";

export const placedOrder = result => ({
	type: PLACED_ORDER,
	payload: {
		result,
	}
})

export const startOrderPlace = () => ({
	type: START_ORDER_PLACE,
});


export const placeOrder = (account, marketId, outcome, order) => {
	return dispatch => {
		console.log("placing order...");
		const spend = parseInt(dollarsToDai(order.spend));
		dispatch(startOrderPlace());
		console.log(	{
			market_id: marketId,
			outcome: outcome,
			spend,
			price_per_share: parseInt(order.odds)
		});
		try {
			account.functionCall(
				window.nearConfig.contractName, 
				"place_order", 
				{
					market_id: marketId,
					outcome: outcome,
					spend,
					price_per_share: parseInt(order.odds)
				},
				new BN("100000000000000"),
				new BN("0")
			).then(res => {
				dispatch(placedOrder(true))
				// TODO: update account balance (initialized in nearAction/reducer)
			});
		}
		catch (err) {
			console.error(err);
			dispatch(placedOrder(false))
		}
	}
}

export const claimEarnings = (account, marketId) => {
	return dispatch => {
		dispatch(startOrderPlace());
		account.functionCall(
			window.nearConfig.contractName, 
			"claim_earnings", 
			{
				market_id: marketId
			},
			new BN("100000000000000"),
			new BN("0")
		).then(() => {
			dispatch(placedOrder(true))
		}).catch(()=> {
			dispatch(placedOrder(false))
		});
	}
}