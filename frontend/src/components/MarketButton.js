import React from 'react';
import styled from 'styled-components';

const marketButton = ({ theme, earnings, marketOrder, isMarketOrder, limitPrice, label, placeOrder}) => {
	const Button = styled.button`
		background-color: '${(marketOrder && isMarketOrder) || !isMarketOrder ? theme : "inactive"}';
		width: 45%;
		padding: 25px;
		border: none;
		color: white;
		font-family: 'Gilroy';
		font-size: 20px;
		border-radius: 6px;	
	`;

	const outcome = label === "no" ? 0 : 1;
	return (
		<>
			<p className={`earnings ${theme}`}>Potential winnings: ${earnings}</p>

			<Button 
				onClick={ () => placeOrder(outcome) } 
				className={`buy-button ${label} ${(marketOrder && isMarketOrder) || !isMarketOrder ? "active" : "inactive"}`}
				type="submit"
			>
				{`${label} ${"\n"}@ ${ isMarketOrder ? marketOrder && 100 - marketOrder.price : limitPrice}`}
			</Button>
		</>
	)
}

export default marketButton;