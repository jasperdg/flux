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
    console.log(this.props.market);
    this.state = {
      orderType: "market",
      limitPrice: 50,
      spend: 0,
      marketNoOrder: null,
      marketYesOrder: null
    }
  }

  componentDidMount = async () => {
    const { getMarketOrder, index } = this.props;
    const marketYesOrder = await getMarketOrder(index, 0);
    const marketNoOrder = await getMarketOrder(index, 1);
    console.log(marketYesOrder, marketNoOrder);
    this.setState({marketYesOrder, marketNoOrder});
  }

  deleteMarket = async () => {
    const { deleteMarket, index } = this.props;
    const deleted = await deleteMarket(index);
    console.log(deleted);
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

  placeOrder = (outcome) => {
    const { placeOrder, index } = this.props;
    let spend = this.state.spend;
    spend = spend * 10000;
    const price = this.getPrice(outcome);
    console.log(typeof price, spend);
    if (placeOrder) {
      if (spend === "" || spend < 10000) throw "please enter how much you want to spend";
      else {
        const amount = Math.round(spend / price);
        this.props.placeOrder(index, outcome, amount, price);
      }
    } else {
      console.error("market contract hasn't been initialized yet, need spinner to load market")
    }
  }

  resoluteOrClaim = () => {
    const { resolute, claimEarnings, market, index } = this.props;
    if (market.resoluted) {
      claimEarnings();
    } else {
      resolute(index, [10000, 0], false);
    }
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

  render() {
    const { market } = this.props;
    const { marketNoOrder, marketYesOrder } = this.state;
    const isMarketOrder = this.state.orderType === "market";

    return (
      <div className="market">
        <h1 onClick={this.resoluteOrClaim} className="market-description">{ this.capitalize(market.description) }?</h1>
        {
          market.resoluted === false &&
          <>
            <div className="order-type-toggle-section">
              <label onClick={this.deleteMarket}>{ this.state.orderType === "limit" ? "Limit order" : "Market order"}</label>
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

            <form className={this.state.orderType === "market" ? "pink" : "blue" } onSubmit={e => this.onSubmit(e)}>
              <TextField 
                className="material-input"
                label="spend"
                margin="normal"
                leadingIcon={(<div>$</div>)}
              >
                <Input  
                  value={this.state.spend}
                  onClick={e => e.target.focus()}
                  onChange={e => this.setState({spend: e.target.value})}
                />
              </TextField>
              
              {
                this.state.orderType === "limit" && (
                  <>
                  <TextField
                    className="material-input"
                    label="price"
                    margin="normal"
                    leadingIcon={(<div>$</div>)}
                  >
                    <Input  
                      value={this.state.limitPrice}
                      onClick={e => e.target.focus()}
                      onChange={e => {
                        if(e.target.value <= 100) this.setState({limitPrice: e.target.value});
                      }}
                    />
                  </TextField>
                  </>
                )
              }
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
            </form>
          </>
        }
      </div>
    );
  }
}

export default Market;