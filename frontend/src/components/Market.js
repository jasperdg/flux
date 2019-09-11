import React, { Component } from 'react';
import '../styles/App.css';

class Market extends Component {
  constructor(props) {
    super(props)
  }

  async componentDidMount() {}

  deleteMarket = async () => {
    const { deleteMarket, index } = this.props;
    const deleted = await deleteMarket(index);
    console.log(deleted);
  }

  render() {
    const { market } = this.props;
    return (
      <div className="market">
        { market.description }
        {/* <button onClick={this.deleteMarket}>delete</button> */}
      </div>
    );
  }
}

export default Market;
