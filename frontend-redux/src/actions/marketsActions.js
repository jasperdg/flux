export const GOT_MARKETS = "GOT_MARKETS";

export const gotMarkets = markets => ({
	type: GOT_MARKETS,
	payload: {
		markets
	}
});

export const getMarkets = contract => {
	return dispatch => {
		return contract.get_all_markets()
		.then(json => {
			const formattedMarkets = Object.keys(json).map(key => {
				json[key].marketOrders = {};
				return json[key]
			});
			dispatch(gotMarkets(formattedMarkets));
			
			formattedMarkets.forEach((market, i) => {
				let promises = [];
				Object.keys(market.orderbooks).forEach(outcome => {
					const marketOrderId = market.orderbooks[outcome].market_order; // TODO Probably want to link actual order instead of order index
					if (marketOrderId > -1) {
						const promise = contract.get_market_order({ market_id: market.id, outcome: parseInt(outcome) });
						promises.push(promise);
					}
				});
				Promise.all(promises).then((marketOrders, j) => {
					marketOrders.forEach(marketOrder => {
						formattedMarkets[i].marketOrders[marketOrder.outcome] = marketOrder
					})
					if (i == formattedMarkets.length -1 && j == marketOrders.length -1) dispatch(gotMarkets(formattedMarkets));
				})
				
			});

			
		})
		.catch (err => console.error(err));

	}
}