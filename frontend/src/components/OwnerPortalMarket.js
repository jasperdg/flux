import React from 'react';
import styled from 'styled-components';
import { YES_WINS_PAYOUT, NO_WINS_PAYOUT, INVALID_MARKET_PAYOUT } from '../constants';
import { fromPayoutDistribution } from '../utils/utils';


// TODO: Set outcomes with button clicks: Resolute; Yes, No or invalid
// TODO: Allow market delition
const Market = styled.div`

`;


export default ({ market, fluxProtocol, getAndUpdateMarkets }) => {
	const deleteMarket = async () => {
		console.log("deleting...");
		const res = await fluxProtocol.deleteMarket(market.id);
		getAndUpdateMarkets();
	}

	const resolute = async (payoutDistribution) => {
		let invalid = payoutDistribution[0] === 5000 ? true : false;
		console.log("resoluting...");
		await fluxProtocol.resoluteMarket(market.id, payoutDistribution, invalid);
		getAndUpdateMarkets();
	}

	return (
		<Market>
			<p>{market.id}. {market.description}</p>
			{!market.resoluted ? 
			<>
				<p>Resolutable: { market.end_time < new Date().getTime() ? "true" : "false" } </p>
				<button onClick={() => resolute(YES_WINS_PAYOUT)}>Resolute yes</button>
				<button onClick={() => resolute(NO_WINS_PAYOUT)}>Resolute no</button>
				<button onClick={() => resolute(INVALID_MARKET_PAYOUT)}>Resolute invalid</button>
			</>
		  : 
			<>
				<p>Resoluted: {fromPayoutDistribution(market.payout_multipliers)} </p>
			</>	
			}
			
			<button onClick={deleteMarket}> Delete</button>
		</Market>
	);
};