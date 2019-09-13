import React, { Component } from 'react';
import '../styles/market.css';
import Switch from "react-switch";
import '@material/react-text-field/dist/text-field.min.css';
import TextField, {HelperText, Input} from '@material/react-text-field';

class Market extends Component {
  constructor(props) {
    super(props)

    this.state = {
      orderType: "market",
      marketPrice: 50,
      price: 50,
      spend: 1000000000,
    }
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

  placeOrder = (position) => {
    const { placeOrder, index } = this.props;
    const { price, spend } = this.state;
    if (placeOrder) {
      if (spend === "" || spend < 10000) throw "please enter how much you want to spend";
      else {
        const amount = Math.round(spend / price);
        const outcome = position === "no" ? 0 : 1;
        this.props.placeOrder(index, outcome, amount, price);
      }
    } else {
      console.error("market contract hasn't been initialized yet, need spinner to load market")
    }
  }

  render() {
    const { market } = this.props;
    const { spend } = this.state;
    const price = this.state.orderType === "market" ? this.state.marketPrice : this.state.price;
    const earnings = Math.round((spend / price) * (100 - price));
    return (
      <div className="market">
        <h1 className="market-description">{ this.capitalize(market.description) }?</h1>
        <div className="order-type-toggle-section">
          <label>{ this.state.orderType === "limit" ? "Limit order" : "Market order"}</label>
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
                  value={this.state.price}
                  onClick={e => e.target.focus()}
                  onChange={e => this.setState({price: e.target.value})}
                />
              </TextField>
              </>
            )
          }
          <div className="bottom-section">
            <p className="earnings pink">Potential winnings: ${earnings}</p>
            <p className="earnings blue">Potential winnings: ${earnings}</p>
            <button onClick={ () => this.placeOrder("no") } className="buy-button no" type="submit">{`No ${"\n"}@ $${ this.state.orderType === "market" ? this.state.marketPrice : this.state.price}`}</button>
            <button onClick={ () => this.placeOrder("yes") } className="buy-button yes" type="submit">{`Yes ${"\n"}@ $${this.state.orderType === "market" ? this.state.marketPrice : this.state.price}`}</button>
          </div>
        </form>

        {/* <button onClick={this.deleteMarket}>delete</button> */}
      </div>
    );
  }
}

export default Market;
