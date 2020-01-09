import React, { useState, useEffect } from 'react';
import '@material/react-text-field/dist/text-field.min.css';
import Countdown from 'react-countdown-now';
import CountdownTimer from './CountdownTimer.js';
import OrderOverview from './OrderOverview';
import OrderTypeToggle from './OrderTypeToggle';
import MarketInput from './MarketInput';
import MarketButton from './MarketButton';
import styled from 'styled-components';
import { BLUE, PINK } from '../constants';
import { fromPayoutDistribution, yoctoToNear, allowanceToColor, daiToDollars } from '../utils/unitConvertion';
import { capitalize } from '../utils/stringManipulation';
import { connect } from 'react-redux';
import { placeOrder, claimEarnings } from '../actions/marketActions';

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
const Allowance = styled.div`
  position: absolute;
  margin-top: 10px;
`;

const AllowanceIndicator = styled.div`
	border-radius: 50%;
	width: 15px;
	height: 15px;
	display: inline-block;
	vertical-align: middle;
	margin-left: 5px;

`

function Market({market, accountData, dispatch, contract}) {
	let lastElement;

	const [orderType, setOrderType] = useState("market")
	const [spend, setSpend] = useState(0);
	const [odds, setOdds] = useState(50);
	const [marketNoOrder, setNoMarketOrder]  = useState(null);
	const [marketYesOrder, setYesMarketOrder]  = useState(null);
	const [earnings, setEarnings]  = useState(0);

	// Update market orders on order placement
	useEffect(() => {
		if (!market.resoluted) {
			const marketNoOrder = market.orderbooks[0] ? market.orderbooks[0].market_order : null;
			const marketYesOrder = market.orderbooks[1] ? market.orderbooks[1].market_order : null;
			setNoMarketOrder(marketNoOrder);
			setYesMarketOrder(marketYesOrder);
		} else {
			contract.get_earnings({market_id: market.id, from: accountData.accountId}).then((claimable) => {
				setEarnings(daiToDollars(claimable));
			});
		}
	}, [])

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

	const toEarnings = (outcome) => {
		if (orderType === "market") {
			if (outcome === 0 && marketNoOrder) {
				return (spend / (100 - marketNoOrder.price) * 100 ).toFixed(2);
			} else if(outcome === 1 && marketYesOrder) {
				return (spend / (100 - marketYesOrder.price) * 100 ).toFixed(2);
			} else {
				return "0.00";
			}
		} else {
			return (spend / (odds / 100)).toFixed(2)
		}
	}

	const order = {
		spend,
		odds
	}

	const ColoredAllowanceIndicator = styled(AllowanceIndicator)`
		background-color: ${allowanceToColor(accountData.allowance)};
	`;

	return (
		<MarketContainer onClick={ifLastElemIsInputBlur}>
			<Allowance >{`allowance:`} <ColoredAllowanceIndicator/> </Allowance>
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

					<Countdown
						zeroPadTime={2}
						date={market.end_time}
						renderer={CountdownTimer}
					/>

					<OrderOverview />

					<ButtonSection>
						<MarketButton 
							theme={PINK}
							marketId={market.id}
							earnings={toEarnings(1)}
							marketOrder = {marketYesOrder}
							orderType={orderType}
							odds={odds}
							label="no"
							placeOrder={() => dispatch(placeOrder(accountData.account, market.id, 0, order))}
							/>

						<MarketButton 
							theme={BLUE}
							marketId={market.id}
							earnings={toEarnings(0)}
							marketOrder = {marketNoOrder}
							orderType={orderType}
							odds={odds}
							label="yes"
							placeOrder={() => dispatch(placeOrder(accountData.account, market.id, 1, order))}
						/>
					</ButtonSection>
				</>
				:
				<div>
					The outcome is: {fromPayoutDistribution(market.payout_multipliers)}
					<button onClick={() => {
						dispatch(claimEarnings(accountData.account, market.id))
					}}>Claim ${earnings}</button> 
				</div>
			}
		</MarketContainer>
	)
}


const mapStateToProps = (state) => ({
	accountData: state.account,
	orderType: state.market.orderType,
	contract: state.near.contract,
	txLoading: state.market.loading,
	contract: state.near.contract
})

export default connect(mapStateToProps)(Market);
