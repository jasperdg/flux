import React, { Component } from 'react';
import '@material/react-text-field/dist/text-field.min.css';
import Countdown from 'react-countdown-now';
import CountDownTimer from './CountDownTimer';
import OrderTypeToggle from './OrderTypeToggle';
import MarketInput from './MarketInput';
import MarketButton from './MarketButton';
import styled from 'styled-components';
import { BLUE, PINK } from '../constants';
import { fromPayoutDistribution } from '../utils/utils';
import OrdersModal from './OrdersModal';

const MarketContainer = styled.div`
  width: 90%;
  height: 95%;
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

class Market extends Component {
  constructor(props) {
    super(props)

    this.state = {
      orderType: "market",
      limitPrice: 50,
      spend: 0,
      marketNoOrder: null,
      marketYesOrder: null,
      earnings: "",
      showOrders: true,
    }
  }

  componentDidMount = async () => {
    const { market } = this.props;
    const { getMarketOrder, getEarningsAmount } = this.props.fluxProtocol;
    let earnings = "";
    const marketYesOrder = await getMarketOrder(market.id, 0);
    const marketNoOrder = await getMarketOrder(market.id, 1);
    if (market.resoluted) {
      earnings = await getEarningsAmount(market.id);
    }
    this.setState({marketYesOrder, marketNoOrder, earnings});
  }

  componentDidUpdate = async (prevProps) => {
    const { market } = this.props;
    const marketId = market.id;
    if (this.orderbookUpdated(prevProps.market.orderbooks["0"], this.props.market.orderbooks["0"])) {
      const marketYesOrder = await this.props.fluxProtocol.getMarketOrder(marketId, 0);
      this.setState({marketYesOrder});
    }

    if (this.orderbookUpdated(prevProps.market.orderbooks["1"], this.props.market.orderbooks["1"])) {
      const marketNoOrder = await this.props.fluxProtocol.getMarketOrder(marketId, 1);
      this.setState({marketNoOrder});
    }
  }

  // TOOD: Make this check better, not have to be done on every update
  orderbookUpdated = (prevOrderbook, orderbook) => {
    return (
      typeof prevOrderbook !== typeof orderbook 
      ||
      ((prevOrderbook && !prevOrderbook.market_order) &&  (orderbook && orderbook.market_order)) 
      ||
      (orderbook &&  orderbook.market_order !== prevOrderbook.market_order)
    )
  }

  toggleOrderType = () => {
    const orderType = this.state.orderType === "market" ? "limit" : "market";
    this.setState({orderType})
  }

  capitalize = (s) => {
    return s.charAt(0).toUpperCase() + s.slice(1)
  }

  getPrice = (position) => {
    const { limitPrice, orderType } = this.state;

    if (orderType === "limit") {
      return parseInt(limitPrice)
    }
    else if (position === 0) return parseInt(100 - this.state.marketNoOrder.price);
    else return parseInt(100 - this.state.marketYesOrder.price);
  }

  placeOrder = async (outcome) => {
    const { startLoader, endLoader, getAndUpdateMarkets, market } = this.props;
    const { placeOrder } = this.props.fluxProtocol;
    let { spend } = this.state;

    // spend = spend * (10 ** 18);
    spend = spend * (10 ** 6);
    const price = this.getPrice(outcome);
    if (placeOrder) {
      if (spend === "" || spend < 10000) throw "please enter how much you want to spend";
      else {
        startLoader();
        const res = await placeOrder(market.id, outcome, spend, price);
        // TODO: this shouldnt be triggered here but through events in the future and should only update markets that are changed/relevant
        getAndUpdateMarkets();
        endLoader(res);
      }
    } else {
      console.error("market contract hasn't been initialized yet, need spinner to load market")
    }
  }

  claimEarnings = async () => {
    console.log(await this.props.fluxProtocol.claimEarnings(this.props.market.id));
  }

  toDollars(num) {
		return `$${(num / 10 ** 6).toFixed(2)}`
  }
  
  calculateEarnings = (order) => {
    const { spend, limitPrice, orderType } = this.state;
    if (order || orderType !== "market") {
      const price = orderType === "market" ? 100 - order.price : limitPrice;
      if (price === "" || price === 0) return 0;
      const earnings = Math.round((spend / price) * (100 - price));
      return earnings;
    } else {
      return 0;
    }
  }

  ifLastElemIsInputBlur = () => {
    const {type} = this.lastElement ? this.lastElement : "";
    if (type === "text") {
      this.lastElement.blur();
    }
    this.lastElement = document.activeElement;
  }

  render() {
    const { market, fluxProtocol } = this.props;
    const { allowance } = fluxProtocol;
    const { marketNoOrder, marketYesOrder, limitPrice } = this.state;
    const isMarketOrder = this.state.orderType === "market";

    return (
      <MarketContainer onClick={this.ifLastElemIsInputBlur}>

        <Allowance >{`allowance: ${allowance && this.toDollars(allowance)}`}</Allowance>
        <Description>{ this.capitalize(market.description) }?</Description>
        {
          market.resoluted === false ?
          <>
            <OrderTypeToggle
              toggleOrderType={this.toggleOrderType}
              orderType={this.state.orderType}
            />

            <MarketInput 
              label = "spend"
              value = {this.state.spend}
              onChange= {e => this.setState({spend: e.target.value})}
            />
            
            {
              this.state.orderType === "limit" && (
                <MarketInput 
                  label = "odds"
                  value = {this.state.limitPrice}
                  onChange= {e => this.setState({limitPrice: e.target.value})}
                />
              )
            }

            <Countdown
              zeroPadTime={2}
              date={market.end_time}
              renderer={CountDownTimer}
            />

            <button onClick={() => this.setState({showOrders: !this.state.showOrders})}>Orders</button>
            { this.state.showOrders && <OrdersModal fluxProtocol={fluxProtocol} market={market} onBlackgroundClick={() => this.setState({showOrders: false})}/>}

            <ButtonSection>
              <MarketButton 
                theme={PINK}
                earnings={this.calculateEarnings(marketNoOrder)}
                marketOrder = {marketNoOrder}
                isMarketOrder={isMarketOrder}
                limitPrice={limitPrice}
                label="no"
                placeOrder={this.placeOrder}
              />

              <MarketButton 
                theme={BLUE}
                earnings={this.calculateEarnings(marketYesOrder)}
                marketOrder = {marketYesOrder}
                isMarketOrder={isMarketOrder}
                limitPrice={limitPrice}
                label="yes"
                placeOrder={this.placeOrder}
              />
            </ButtonSection>
        </>
        : 
        <div>
          The outcome is: {fromPayoutDistribution(market.payout_multipliers)}
          <button onClick={this.claimEarnings}>Claim {this.state.earnings}</button>
        </div>
        }
      </MarketContainer>
    );
  }
}

export default Market;
