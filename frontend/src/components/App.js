import React, { Component } from 'react';
import Markets from './Markets';
import Header from './Header';
import SplashScreen from './SplashScreen';
import Loader from './Loader';
import FluxProtocolWrapper from "./../wrappers/FluxProtocolWrapper";
import OwnerPortal from './OwnerPortal';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      markets: [],
      showLoader: false,
      txRes: null,
      loading: true,
      fluxProtocol: new FluxProtocolWrapper(),
      isOwner: false,
    }
  }
  
  async componentDidMount() {
    await this.state.fluxProtocol.init();

    // TODO: Quit loading once entire frontent is loaded
    await this.getAndUpdateMarkets();
    this.setState({
      loading: false,
      isOwner: this.state.fluxProtocol.isOwner,
    });
  }

  startLoader = () => {
    this.setState({showLoader: true});
  }

  endLoader = (res) => {
    this.setState({
      txRes: res,
      showLoader: false,
      txRes: null
    });
  }

  formatMarkets = (markets) => {
    const formattedMarkets = [];
    for (const marketId in markets) {
      const market = markets[marketId];
      formattedMarkets.push(market);
    }
    return formattedMarkets;
  }

  getAndUpdateMarkets = async () => {
    const markets = await this.state.fluxProtocol.contract.get_all_markets();

    const formattedMarkets = this.formatMarkets(markets)
    this.setState({markets: formattedMarkets});
  }

  render() {
    return (
      <div className="App">
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
        { this.state.isOwner && <OwnerPortal             
                                  getAndUpdateMarkets={this.getAndUpdateMarkets}
                                  markets={this.state.markets} 
                                  fluxProtocol={this.state.fluxProtocol}
                                />
        }
        {
          this.state.markets.length > 0
          &&
          <Markets
            markets={this.state.markets}
            fluxProtocol={this.state.fluxProtocol}
            startLoader={this.startLoader}
            endLoader={this.endLoader}
            getAndUpdateMarkets={this.getAndUpdateMarkets}
          />
        }
      </div>
    );
  }
}

export default App;