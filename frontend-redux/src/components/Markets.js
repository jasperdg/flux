import React, { useState, useEffect, createRef } from 'react';
import { CarouselProvider, Slider, Slide, Dot } from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';
import styled from 'styled-components';
import { connect } from 'react-redux';
import Market from './Market';
import Spinner from './Spinner';

const MarketsContainer = styled.div`
  width: 100%;
  height: 85vh;
  display: block;
  margin: 0 auto;
`

const ClearNav = styled(Dot)`
  border: none;
  background-color: transparent;
`

const StyledSpinner  = styled(Spinner)`
	left: calc(50% - 32px);
	top: calc(50% - 32px);
`

const DotsContainer = styled.ul`
	display: flex;
	margin: 0 auto;
	margin-top: 20px;
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

const Markets = ({markets, loading}) => {
	let [containerWidth, setContainerWidth] = useState(0)
	let [containerHeight, setContainerHeight] = useState(0)
	const marketsContainer = createRef();

	useEffect(() => {
		let unmounted = false;
		if (!unmounted) {
			setContainerWidth(marketsContainer.current.clientWidth);
			setContainerHeight(marketsContainer.current.clientHeight);
		}
		return () => { unmounted = true };
	}, []);

	return (
		<MarketsContainer ref={marketsContainer} id="markets-container">

			{
				loading ? 
				<StyledSpinner /> 
				:
				<CarouselProvider
				naturalSlideWidth={containerWidth}
				naturalSlideHeight={containerHeight}
				totalSlides={markets.length}
				>
					<Slider>
						{
							markets.map((market, i) => (
								<Slide key={i} index={i}>
									<Market market={market} key={i}/>
								</Slide>
							))
						}
					</Slider>
					

					<DotsContainer>
						{
							
							markets.map((market, i) => {
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
			}
		</MarketsContainer>
	);
}

const mapStateToProps = (state) => ({
	markets: state.markets.markets,
	loading: state.markets.loading
})
export default connect(mapStateToProps)(Markets);
