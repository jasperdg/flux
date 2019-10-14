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
    const { markets } = this.props;
    return (
      //TODO: Carousel could be in a compoentn of it's own
      <div id="markets-view">
        <CarouselProvider
        naturalSlideWidth={this.state.containerWidth}
        naturalSlideHeight={this.state.containerHeight}
        totalSlides={markets.length}
        >
          <Slider>
            {
              this.props.markets.map((market, i) => {
                return (
                  <Slide key={i} index={i}>
                    <Market 
                    index={i} 
                    market={market}
                    fluxProtocol={this.props.fluxProtocol}
                    startLoader={this.props.startLoader}
                    endLoader={this.props.endLoader}
                    />                
                  </Slide>
                );
              })
            }
          </Slider>
          

          <ul className="dots-ul">
            {
              this.props.markets.map((market, i) => {
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
