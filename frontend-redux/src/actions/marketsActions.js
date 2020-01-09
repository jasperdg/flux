export const GOT_MARKETS = "GOT_MARKETS";
export const LOADING_MARKETS = "LOADING_MARKETS";

export const loadingMarkets = () => ({
	type: LOADING_MARKETS
})

export const gotMarkets = markets => ({
	type: GOT_MARKETS,
	payload: {
		markets
	}
});

export const getMarkets = contract => {
	return dispatch => {
		dispatch(loadingMarkets());
		
		return contract.get_all_markets()
		.then(json => {
			const formattedMarkets = Object.keys(json).map(key => {
				json[key].marketOrders = {};
				return json[key]
			});
			dispatch(gotMarkets(formattedMarkets));
		})
		.catch (err => console.error(err));

	}
}


export const updateMarkets = contract => {
	return dispatch => {		
		return contract.get_all_markets()
		.then(json => {
			const formattedMarkets = Object.keys(json).map(key => {
				json[key].marketOrders = {};
				return json[key]
			});
			dispatch(gotMarkets(formattedMarkets));
		})
		.catch (err => console.error(err));

	}
}