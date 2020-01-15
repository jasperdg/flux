import React, {useState} from 'react';
import styled from 'styled-components';
import OrderViewSwitch from './OrderViewSwitch';
import Orderbook from './Orderbook';

//TODO: Text in constants
function OrderOverview({userOrders}) {
	const [orderView, setOrderView] = useState("FILLED");

	const toggleOrderView = () => {
		const newState = orderView === "FILLED" ? "OPEN" : "FILLED";
		setOrderView(newState)
	}

	return (
		<>
			<OrderViewSwitch toggle={toggleOrderView} activeView={orderView}/>
			<Orderbook userOrders={userOrders} orderType={orderView}/>
		</>
	);
}


export default OrderOverview;
