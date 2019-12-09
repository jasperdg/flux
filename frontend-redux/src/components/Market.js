import React, { useState } from 'react';
import '@material/react-text-field/dist/text-field.min.css';
import Countdown from 'react-countdown-now';
import CountdownTimer from './CountdownTimer.js';
import OrderTypeToggle from './OrderTypeToggle';
import MarketInput from './MarketInput';
import MarketButton from './MarketButton';
import styled from 'styled-components';
import { BLUE, PINK } from '../constants';
// import { fromPayoutDistribution } from '../utils/utils';
// import OrdersModal from './OrdersModal';
import { capitalize } from '../utils/stringManipulation';
import { connect } from 'react-redux';
import { toDollars, toEarnings } from '../utils/unitConvertion';
import { placeOrder } from '../actions/marketActions';

const MarketContainer = styled.div`
  width: 90%;
  height: 100%;
  padding: 0 5%;
  position: relative;
  display: block;
  background-color: white;
  border-radius: 8px;
  box-sizing: border-box;
  -webkit-box-shadow: 0 2px 4px 0 rgb(171, 190, 200);
  -moz-box-shadow: 0 2px 4px 0 rgb(171, 190, 200);
  box-shadow: 0 2px 4px 0 rgb(171, 190, 200);
  margin-left: 5%;
  overflow: hidden;
`;

const ButtonSection = styled.div`
  width: 88%;
  position: absolute;
  bottom: 5%;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
`;

const Description = styled.h1`
	color: #310094;
	padding: 45px 30px;
	display: block;
	margin: 0 auto;
`
const Allowance = styled.span`
  position: absolute;
  margin-top: 10px;
`;

function Market({market, account, dispatch}) {
	let lastElement;

	const [orderType, setOrderType] = useState("market")
	const [spend, setSpend] = useState(0);
	const [odds, setOdds] = useState(50);

	const toggleOrderType = () => {
		setOrderType(orderType == "market" ? "limit" : "market");
	}

	const onInputChange = (field, value) => {
		if (field == "spend") setSpend(value);
		else if (field == "odds") setOdds(value);
	}

	const ifLastElemIsInputBlur = () => {
    const { type } = lastElement ? lastElement : "";
    if (type === "text") {
      lastElement.blur();
    }
    lastElement = document.activeElement;
	}
	console.log(market);
	const order = {
		spend,
		odds
	}

	return (
		<MarketContainer onClick={ifLastElemIsInputBlur}>
			<Allowance >{`allowance: ${account && toDollars(account.allowance)}`}</Allowance>
			<Description>{ capitalize(market.description) }?</Description>
			{
				!market.resoluted ? 
				<>
					<OrderTypeToggle
						onChange={toggleOrderType}
						orderType={orderType}
					/>
					<MarketInput 
					label = "spend"
					onChange = {onInputChange}
					value = {spend}
					/>
            {
							orderType === "limit" && (
								<MarketInput 
									label = "odds"
									onChange = {onInputChange}
									value = {odds}
                />
              )
            }
				</>
				:
				null
			}

			<Countdown
				zeroPadTime={2}
				date={market.end_time}
				renderer={CountdownTimer}
			/>

			<ButtonSection>
				<MarketButton 
					theme={PINK}
					marketId={market.id}
					earnings={toEarnings(order)}
					marketOrder = {market.marketOrders[0]}
					// isMarketOrder={isMarketOrder}
					// limitPrice={limitPrice}
					label="no"
					placeOrder={() => dispatch(placeOrder(market.id, 0, order))}
				/>

				<MarketButton 
					theme={BLUE}
					marketId={market.id}
					earnings={toEarnings(order)}
					marketOrder = {market.marketOrders[1]}
					// isMarketOrder={isMarketOrder}
					// limitPrice={limitPrice}
					label="yes"
					placeOrder={() => dispatch(placeOrder(market.id, 1, order))}
				/>
			</ButtonSection>

		</MarketContainer>
	)
}


const mapStateToProps = (state) => ({
	account: state.account,
	orderType: state.market.orderType
})

export default connect(mapStateToProps)(Market);
