import React from 'react';

const marketButton = (props) => {
	const { theme, earnings, marketOrder, isMarketOrder, limitPrice, label, placeOrder} = props;
	const outcome = label === "pink" ? 0 : 1;
	return (
		<>
			<p className={`earnings ${theme}`}>Potential winnings: ${earnings}</p>

			<button 
              onClick={ () => placeOrder(outcome) } 
              className={`buy-button ${label} ${(marketOrder && isMarketOrder) || !isMarketOrder ? "active" : "inactive"}`}
              type="submit"
              >
                {`${label} ${"\n"}@ ${ isMarketOrder ? marketOrder && 100 - marketOrder.price : limitPrice}`}
              </button>
		</>
	)
}

export default marketButton;