import React, { Component } from 'react';
import Modal from './Modal';
import Order from './Order';
import styled from 'styled-components';

const Orders = styled.div`

`

const Title = styled.h3`
	text-align: center;
`

const Headers = styled.div`
	display: flex;
	justify-content: space-around;
`

const Header = styled.p`
	text-align: center;
	width: 30%;
	margin: 0;
	font-weight: 600;
`

class OrdersModal extends Component {
	constructor(props) {
		super(props);
		this.state = {
			openNoOrders: [],
			openYesOrders: [],
			filledNoOrders: [],
			filledYesOrders: []
		}
	}

	componentDidMount = async () => {
		const { fluxProtocol, market } = this.props;
		const orders = [
			fluxProtocol.getOpenOrders(market.id, 0), 
			fluxProtocol.getOpenOrders(market.id, 1), 
			fluxProtocol.getFilledOrders(market.id, 0),
			fluxProtocol.getFilledOrders(market.id, 1)
		];
		const [openNoOrders, openYesOrders, filledNoOrders, filledYesOrders] = await Promise.all(orders);
		this.setState({openNoOrders, openYesOrders, filledNoOrders, filledYesOrders});
	}

	render () {
		return (
			<Modal width={"70%"} height={"60%"} blackground={true} onBlackgroundClick={this.props.onBlackgroundClick}>
				<Orders>
					<Title>No Orders</Title>
					<Headers>
						<Header>Spend</Header>
						<Header>Price</Header>
						<Header>Filled</Header>
					</Headers>
					{this.state.openNoOrders.map((order, key) => {
						return <Order data={order} key={key}/>
					})}
				</Orders>

				<Orders>
					<Title>Yes Orders</Title>
					<Headers>
						<Header>Spend</Header>
						<Header>Price</Header>
						<Header>Filled</Header>
					</Headers>
					{this.state.openYesOrders.map((order, key) => {
						return <Order data={order} key={key}/>
					})}
				</Orders>
			</Modal>
		)
	}
}

export default OrdersModal;