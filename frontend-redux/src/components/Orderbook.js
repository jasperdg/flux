import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';

function Orderbook({orderType, accountId}) {
	let lastOrderType = orderType;

	useEffect(() => {
		console.log(`doign this ${lastOrderType}`);
	}, [])
	return (
		<>

		</>
	);
}

const mapStateToProps = state => ({
	accountId: state.account.accountId
})
export default connect(mapStateToProps)(Orderbook);
