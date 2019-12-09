export const PLACED_ORDER = "PLACED_ORDER";
export const START_ORDER_PLACE = "START_ORDER_PLACE";

export const placedOrder = result => ({
	type: PLACED_ORDER,
	payload: {result}
})

export const startOrderPlace = () => ({
	type: START_ORDER_PLACE,
})

export const placeOrder = (marketId, outcome, order) => {
	return dispatch => {
		dispatch(startOrderPlace());
	}
}