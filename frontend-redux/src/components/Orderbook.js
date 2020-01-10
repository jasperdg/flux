import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { daiToDollars } from '../utils/unitConvertion';

const Book = styled.div`
`;

const Header = styled.div`
	margin-top: 2%;
	font-family: "Gilroy";
	display: flex;
	justify-content: space-between;
	width: 100%;
	font-family: "Gilroy";
`
const CollumnTitle = styled.div`
	text-align: center;
	width: 25%;
	margin: 0;
	padding: 0;
`;

const Body = styled.div`
	max-height: 200px;
	overflow: scroll;
`;
const Row = styled.div`
	display: flex;
	width: 100%;
	justify-content: space-between;
	border-top: solid 1px rgba(0,0,0, 0.2);
	margin: 5px 0;
`;
const Entry = styled.div`
	text-align: center;
	width: 25%;
	margin: 0;
	padding: 0;
`;


function Orderbook({orderType, contract, accountId, marketId}) {
	const [orders, setOrders ] = useState([]);
	const [lastOrderType, setLastOrderType] = useState(null)
	
	useEffect( () => {
		if(lastOrderType !== orderType) {
			let unmounted = false;	
			Promise.all([
				contract[`get_${orderType.toLowerCase()}_orders`]({market_id: marketId, outcome: 0, from: accountId}),
				contract[`get_${orderType.toLowerCase()}_orders`]({market_id: marketId, outcome: 1, from: accountId}),
			]).then(res => {
				if (!unmounted) {
					setOrders(res);
					setLastOrderType(orderType)
				}})
				.catch(err => console.error(err));
		
				return () => { unmounted = true };
		}
	})

	const formattedOrderElems = [];
	
	let key = 0;
	// TODO combine all orders that are bought at one specific price.
	// TODO update current orderbook on orderplacement
	orders.forEach((outcome, i) => {
		outcome.forEach((order) => {
			formattedOrderElems.push(
			<Row key={key}>
				<Entry>{i === 0 ? "NO" : "YES"} </Entry>
				<Entry>{daiToDollars(order.amount * order.price)} </Entry>
				<Entry>{order.price}</Entry>
				<Entry>{parseInt(order.amount_filled) / parseInt(order.amount) * 100}%</Entry>
			</Row>)
			key++;
		})
	})

	return (
		<Book>
			<Header>
				<CollumnTitle>outcome</CollumnTitle>
				<CollumnTitle>spend</CollumnTitle>
				<CollumnTitle>price</CollumnTitle>
				<CollumnTitle>filled</CollumnTitle>
			</Header>
			<Body>
				{formattedOrderElems}
			</Body>
		</ Book>
	);
}

const mapStateToProps = state => ({
	accountId: state.account.accountId,
	contract: state.near.contract
})
export default connect(mapStateToProps)(Orderbook);
