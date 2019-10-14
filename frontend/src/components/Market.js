import React, { Component } from 'react';
import '../styles/market.css';
import Switch from "react-switch";
import '@material/react-text-field/dist/text-field.min.css';
import TextField, {HelperText, Input} from '@material/react-text-field';
import Countdown from 'react-countdown-now';
import CountDownTimer from './CountDownTimer';

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
  componentDidUpdate = async (prevProps) => {
    const { index } = this.props;
    const prevYesOrderbooks = prevProps.market.orderbooks["0"];
    const yesOrderbooks = this.props.market.orderbooks["0"];
    const prevNorderbooks = prevProps.market.orderbooks["1"];
    const noOrderbooks = this.props.market.orderbooks["1"];

    if (
      // TODO: To isUpdated function
      typeof prevYesOrderbooks !== typeof yesOrderbooks 
      ||
      ((prevYesOrderbooks && !prevYesOrderbooks.market_order) &&  (yesOrderbooks && yesOrderbooks.market_order)) 
      ||
      (yesOrderbooks &&  yesOrderbooks.market_order !== prevYesOrderbooks.market_order)
    ) {
      const marketYesOrder = await this.props.fluxProtocol.getMarketOrder(index, 0);
      console.log("hi1", marketYesOrder);

      this.setState({marketYesOrder});
    }

    if (
      // TODO: To isUpdated function
      typeof prevNorderbooks !== typeof noOrderbooks 
      ||
      ((prevNorderbooks && !prevNorderbooks.market_order) &&  (noOrderbooks && noOrderbooks.market_order)) 
      ||
      (noOrderbooks &&  noOrderbooks.market_order !== prevNorderbooks.market_order)
    ) {
      const marketNoOrder = await this.props.fluxProtocol.getMarketOrder(index, 1);
      console.log("hi2", marketNoOrder);
      this.setState({marketNoOrder});
    }

  }
  componentDidMount = async () => {
    const { index } = this.props;
    const { getMarketOrder } = this.props.fluxProtocol;

    const marketYesOrder = await getMarketOrder(index, 0);
    const marketNoOrder = await getMarketOrder(index, 1);
    console.log(await getMarketOrder(index, 0));

    this.setState({marketYesOrder, marketNoOrder});
  }

  toggleOrderType = () => {
    const orderType = this.state.orderType === "market" ? "limit" : "market";
    this.setState({orderType})
  }

  capitalize = (s) => {
    return s.charAt(0).toUpperCase() + s.slice(1)
  }

  onSubmit = (e) => {
    e.preventDefault();
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

  // TODO: Show resolute view when market is finalized
  resoluteOrClaim = () => {
    const { market, index } = this.props;
    const { resolute, claimEarnings } = this.props.fluxProtocol;

    if (market.resoluted) {
      claimEarnings(index);
      // TODO: Update frontend on claim
    } else {
      // TODO: Update frontend on resolute
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
    const { marketNoOrder, marketYesOrder } = this.state;
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
            <div className="order-type-toggle-section">
              <label onClick={this.resoluteOrClaim}>{ this.state.orderType === "limit" ? "Limit order" : "Market order"}</label>
              <Switch 
                checkedIcon={false} 
                uncheckedIcon={false}
                className="order-type-toggle"
                onColor="#5400FF"
                offColor="#FF009C"
                onChange={this.toggleOrderType} 
                checked={this.state.orderType === "limit"} 
              />
            </div>

            {/* <form className={this.state.orderType === "market" ? "pink" : "blue" } onSubmit={e => this.onSubmit(e)}> */}
            <div className="inputs">
            <TextField 
                className="material-input"
                label="spend"
                margin="normal"
                leadingIcon={(<div>$</div>)}
              >
                <Input  
                  value={this.state.spend}
                  onClick={e => e.target.focus()}
                  ref={this.spendInput}
                  onChange={e => this.setState({spend: e.target.value})}
                />
              </TextField>
              
              {
                this.state.orderType === "limit" && (
                  <>
                    <TextField
                      className="material-input"
                      label="odds"
                      margin="normal"
                      leadingIcon={(<div>%</div>)}
                    >
                      <Input  
                        value={this.state.limitPrice}
                        onClick={e => e.target.focus()}
                        ref={this.priceInput}
                        onChange={e => {
                          if(e.target.value <= 100) this.setState({limitPrice: e.target.value});
                        }}
                      />
                    </TextField>
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
                <p className="earnings pink">Potential winnings: ${this.calculateEarnings(this.state.marketNoOrder)}</p>
                <p className="earnings blue">Potential winnings: ${this.calculateEarnings(this.state.marketYesOrder)}</p>

                <button 
                onClick={ () => this.placeOrder(0) } 
                className={`buy-button no ${(marketNoOrder && isMarketOrder) || !isMarketOrder ? "active" : "inactive"}`}
                type="submit"
                >
                  {`No ${"\n"}@ ${ isMarketOrder ? marketNoOrder && 100 - marketNoOrder.price : this.state.limitPrice}`}
                </button>

                <button 
                onClick={ () => this.placeOrder(1) } 
                className={`buy-button yes ${(marketYesOrder && isMarketOrder) || !isMarketOrder ? "active" : "inactive"}`}
                type="submit"
                >
                  {`Yes ${"\n"}@ ${ isMarketOrder ? marketYesOrder && 100 - marketYesOrder.price : this.state.limitPrice}`}
                </button>
              </div>
            {/* </form> */}
          </>
        }
      </div>
    );
  }
}

export default Market;
