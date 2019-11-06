import React, { useState } from 'react';
import styled from 'styled-components';
import OwnerPortalMarket from './OwnerPortalMarket';

const OwnerPortalContainer = styled.div`
`;
const ShowHideButton = styled.button``;

const OwnerPortal = ({markets, fluxProtocol, getAndUpdateMarkets}) => {
	const [description, setDescription] = useState('dbjnadnasdnasd');
	const [endTime, setEndtime] = useState(157304608000000);
	const [show, toggleShow] = useState(true);


	const handleEvent = async (e) => {
		e.preventDefault();
		const res = await fluxProtocol.createMarket(description, endTime);
		console.log(res);
		getAndUpdateMarkets();
	}


	return (
		<>
			<ShowHideButton onClick={e => toggleShow(!show)}>{show ? "-" : "+"}</ShowHideButton>
			{show && <OwnerPortalContainer>
				<label>New market:</label>
				<form onSubmit={ (e) => handleEvent(e) }>
					<input
						type="text"
						value={description}
						onChange={event => setDescription(event.target.value)} 
					/>

					<label>end time:</label>
					<input
						type="text"
						value={endTime}
						onChange={event => setEndtime(event.target.value)} 
					/>
					<button type="submit">-></button>
				</form>
				{ 
					markets.map((market, i) => {
						return <OwnerPortalMarket 
											key={i} 
											market={market} 
											fluxProtocol={fluxProtocol} 
											getAndUpdateMarkets={getAndUpdateMarkets}
										/>
					})
				}
			</OwnerPortalContainer>}
		</>
	);
};

export default OwnerPortal;