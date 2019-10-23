import React, { Component } from 'react';
import Market from './Market';
import { CarouselProvider, Slider, Slide, Dot } from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';
import styled from 'styled-components';

const MarketsContainer = styled.div`
  width: 100vw;
  height: 85vh;
  display: block;
  margin: 0 auto;
`

const ClearNav = styled(Dot) `
  border: none;
  background-color: transparent;
`

const DotsContainer = styled.ul`
	position: relative;
	display: flex;
	margin: 0 auto ;
	padding: 0;
	list-style: none;
	cursor: default;
	justify-content: space-around;
  max-width: 120px;

  & li {
    position: relative;
    width: 8px;
    height: 8px;
    cursor: pointer;
    }
    
  & li a {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  outline: none;
  border-radius: 50%;
  background-color: #fff;
  background-color: rgba(255, 0, 156, 0.3);
  text-indent: -999em;
  cursor: pointer; /* make the text accessible to screen readers */
  position: absolute;
  }
  
  & li a {
  -webkit-transition: -webkit-transform 0.3s ease, background-color 0.3s ease;
  transition: transform 0.3s ease, background-color 0.3s ease;
  }
  
  & li a:hover,
  & li a:focus {
  background-color: #FF009C;
  }
  
  & .carousel__dot--selected li  a {
  background-color: #FF009C;
  -webkit-transform: scale(1.5);
  transform: scale(1.5);
  }
`

class Markets extends Component {
  constructor(props) {
    super(props);

    this.state = {
      containerWidth: 0,
      containerHeight: 0,
    }
  }

  async componentDidMount() {
    const containerWidth = document.getElementById('markets-container').clientWidth;
    const containerHeight = document.getElementById('markets-container').clientHeight;
    this.setState({containerHeight, containerWidth});
  }


  // TODO only lazyload data if it's the seleted market
  render() {
    const { markets, getAndUpdateMarkets, fluxProtocol, startLoader, endLoader} = this.props;

    return (
      <MarketsContainer id="markets-container">
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
                      fluxProtocol={fluxProtocol}
                      startLoader={startLoader}
                      endLoader={endLoader}
                      getAndUpdateMarkets={getAndUpdateMarkets}
                    />                
                  </Slide>
                );
              })
            }
          </Slider>
          

          <DotsContainer>
            {
              this.props.markets.map((market, i) => {
                return (
                  <ClearNav key={i} slide={i}>
                    <li>
                      <a/>
                    </li>
                  </ClearNav>
                )
              })
            }
          </DotsContainer>
          
        </CarouselProvider>
      </MarketsContainer>
    );
  }
}

export default Markets;
