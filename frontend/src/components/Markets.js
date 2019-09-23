import React, { Component } from 'react';
import '../styles/markets.css';
import Market from './Market';
import { CarouselProvider, Slider, Slide, Dot } from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';
class Markets extends Component {
  constructor(props) {
    super(props);

    this.state = {
      containerWidth: 0,
      containerHeight: 0,
    }
  }

  async componentDidMount() {
    const containerWidth = document.getElementById('markets-view').clientWidth;
    const containerHeight = document.getElementById('markets-view').clientHeight;
    this.setState({containerHeight, containerWidth});
  }

  render() {
    const { deleteMarket, placeOrder, resolute, claimEarnings, getMarketOrder } = this.props;
    
    return (
      <div id="markets-view">
        <CarouselProvider
        naturalSlideWidth={this.state.containerWidth}
        naturalSlideHeight={this.state.containerHeight}
        totalSlides={this.props.markets.length}
        >
          <Slider>
            {
              this.props.markets.map((market, i) => {
                return (
                  <Slide key={i} index={i}>
                    <Market 
                    allowance={this.props.allowance}
                    index={i} 
                    market={market}
                    getMarketOrder={getMarketOrder}
                    placeOrder={placeOrder} 
                    deleteMarket={deleteMarket}
                    resolute={resolute}
                    claimEarnings={claimEarnings}
                    />                
                  </Slide>
                );
              })
            }
          </Slider>
          

          <ul className="dots-ul">
            {
              this.props.markets.map((markets, i) => {
                return (
                  <Dot key={i} className="dot clear-button-style" slide={i}>
                    <li>
                      <a/>
                    </li>
                  </Dot>
                )
              })
            }
          </ul>
          
        </CarouselProvider>
      </div>
    );
  }
}

export default Markets;
