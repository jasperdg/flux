import React, { Component } from 'react';
import '../styles/market.css';
import '@material/react-text-field/dist/text-field.min.css';
import Countdown from 'react-countdown-now';
import CountDownTimer from './CountDownTimer';
import OrderTypeToggle from './OrderTypeToggle';
import MarketInput from './MarketInput';
import MarketButton from './MarketButton';

class Market extends Component {
  constructor(props) {
    super(props)

    this.state = {
      orderType: "market",
      limitPrice: 50,
      spend: 0,
      marketNoOrder: null,
      marketYesOrder: null
    }
  }

  componentDidMount = async () => {
    const { index } = this.props;
    const { getMarketOrder } = this.props.fluxProtocol;

    const marketYesOrder = await getMarketOrder(index, 0);
    const marketNoOrder = await getMarketOrder(index, 1);

    this.setState({marketYesOrder, marketNoOrder});
  }

  componentDidUpdate = async (prevProps) => {
    const { index } = this.props;

    if (this.orderbookUpdated(prevProps.market.orderbooks["0"], this.props.market.orderbooks["0"])) {
      const marketYesOrder = await this.props.fluxProtocol.getMarketOrder(index, 0);
      this.setState({marketYesOrder});
    }

    if (this.orderbookUpdated(prevProps.market.orderbooks["1"], this.props.market.orderbooks["1"])) {
      const marketNoOrder = await this.props.fluxProtocol.getMarketOrder(index, 1);
      this.setState({marketNoOrder});
    }
  }

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
    const { index, startLoader, endLoader } = this.props;
    const { placeOrder } = this.props.fluxProtocol;
    let { spend } = this.state;

    // spend = spend * (10 ** 18);
    spend = spend * (10 ** 6);
    const price = this.getPrice(outcome);
    if (placeOrder) {
      startLoader();
      if (spend === "" || spend < 10000) throw "please enter how much you want to spend";
      else {
        const amount = Math.round(spend / price);
        const res = await placeOrder(index, outcome, amount, price);
        endLoader(res);
      }
    } else {
      console.error("market contract hasn't been initialized yet, need spinner to load market")
    }
  }

  resoluteOrClaim = () => {
    const { market, index } = this.props;
    const { resolute, claimEarnings } = this.props.fluxProtocol;

    if (market.resoluted) {
      claimEarnings(index);
    } else {
      resolute(index, [10000, 0], false);
    }
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

  // TODO: Breakup into more different pieces
  render() {
    const { market } = this.props;
    const { allowance } = this.props.fluxProtocol;
    const { marketNoOrder, marketYesOrder, limitPrice } = this.state;
    const isMarketOrder = this.state.orderType === "market";
    
    return (
      <div className="market"
        onClick={
          () => {
            const {type} = this.lastElement ? this.lastElement : "";
            if (type === "text") {
              this.lastElement.blur();
            }
            this.lastElement = document.activeElement;
          }
        }
      >
        <span className="allowance">{`allowance: ${allowance && this.toDollars(allowance)}`}</span>
        <h1 onClick={() => {if (market.resoluted) this.resoluteOrClaim()}} className="market-description">{ this.capitalize(market.description) }?</h1>
        {
          market.resoluted === false &&
          <>
            <OrderTypeToggle
              toggleOrderType={this.toggleOrderType}
              orderType={this.state.orderType}
            />

            <div className="inputs">
              <MarketInput 
                label = "spend"
                value = {this.state.spend}
                onChange= {e => this.setState({spend: e.target.value})}
              />
              
              {
                this.state.orderType === "limit" && (
                  <>
                    <MarketInput 
                      label = "odds"
                      value = {this.state.value}
                      onChange= {e => this.setState({limitPrice: e.target.value})}
                    />
                  </>
                )
              }
            </div>

            <Countdown
              zeroPadTime={2}
              date={market.end_time}
              renderer={CountDownTimer}
            />

            <div className="bottom-section">

              <MarketButton 
                theme="pink"
                earnings={this.calculateEarnings(marketNoOrder)}
                marketOrder = {marketNoOrder}
                isMarketOrder={isMarketOrder}
                limitPrice={limitPrice}
                label="no"
              />

              <MarketButton 
                theme="blue"
                earnings={this.calculateEarnings(marketNoOrder)}
                marketOrder = {marketYesOrder}
                isMarketOrder={isMarketOrder}
                limitPrice={limitPrice}
                label="yes"
              />
            </div>
        </>
        }
      </div>
    );
  }
}

export default Market;
