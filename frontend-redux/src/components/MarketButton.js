import React from 'react';
import styled from 'styled-components';

const MarketButton = ({theme, marketOrder, label, placeOrder, earnings}) => {
		/* background-color: ${(marketOrder && isMarketOrder) || !isMarketOrder ? theme : 'grey'}; */
	const Button = styled.button`
		width: 100%;
		padding: 25px;
		border: none;
		color: white;
		font-family: 'Gilroy';
		font-size: 20px;
		border-radius: 6px;	
	`;

	const Earnings = styled.div`
		font-size: 18px;
		width: 100%;
		text-align: center;
		margin-bottom: 5px;
		color: ${theme};
	`;

	const MarketButtonWrapper = styled.div`
		width: 47%;
	`
	const outcome = label === "no" ? 0 : 1;
	return (
		<MarketButtonWrapper>
			<Earnings>Potential winnings: ${earnings}</Earnings>

			<Button 
				onClick={placeOrder} 
				type="submit"
			>
				{/* {`${label} }@ ${ isMarketOrder ? marketOrder && 100 - marketOrder.price : limitPrice}`} */}
				{`${label}`}
			</Button>
		</MarketButtonWrapper>
	)
}

export default MarketButton;