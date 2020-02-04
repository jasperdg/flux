import React from 'react'
import styled from 'styled-components';
import { toDollars } from '../utils/utils';

const OrderContainer = styled.div`
	display: flex;
	justify-content: space-around;
`

const Data = styled.p`
	text-align: center;
	width: 30%;
	margin: 0;
`

export default function Order({data}) {
	const { amount, price, amount_filled } = data;
	const percentageFilled = (amount_filled / amount * 100).toFixed(2);


	return (
		<OrderContainer>
			<Data>{toDollars(amount * price)}</Data>
			<Data>{price}</Data>
			<Data>{percentageFilled}%</Data>

		</OrderContainer>
	);
}