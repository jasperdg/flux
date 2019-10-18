import React, { Component } from 'react';
import Markets from './Markets';
import '../styles/App.css';
import Header from './Header';
import SplashScreen from './SplashScreen';
import Loader from './Loader';
import FluxProtocolWrapper from "./../wrappers/FluxProtocolWrapper";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      markets: [],
      showMarkets: true,
      isRightUrl:false,
      showLoader: false,
      txRes: null,
      loading: true,
      fluxProtocol: new FluxProtocolWrapper(),
      
    }
  }
  
  async componentDidMount() {
    // await this.state.fluxProtocol.init();
    
    this.setState({
      loading: false,
      // markets: await this.state.fluxProtocol.getMarkets()
    });
  }

  startLoader = () => {
    this.setState({showLoader: true});
  }

  endLoader = (res) => {
    this.setState({txRes: res});
    setTimeout( () => this.setState({
      showLoader: false,
      txRes: null
    }), 500)
  }

  getAndUpdateMarkets = async () => {
    const markets = await this.state.fluxProtocol.contract.get_all_markets();
    this.setState({markets});
  }

  render() {
    return (
      <div className="App">
        <>
        {this.state.loading && <SplashScreen />}
        <Loader 
          txRes={this.state.txRes}
          isActive={this.state.showLoader}
        />
        <Header
          fluxProtocol={this.state.fluxProtocol}
          startLoader={this.startLoader}
          endLoader={this.endLoader}
          getAndUpdateMarkets={this.getAndUpdateMarkets}
        />
        {
          this.state.markets.length > 0
          &&
          <Markets
          markets={this.state.markets}
          fluxProtocol={this.state.fluxProtocol}
          startLoader={this.startLoader}
          endLoader={this.endLoader}
          />
        }
        </>
      
      </div>
    );
  }
}

export default App;