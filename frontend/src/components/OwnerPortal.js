import React, { useState } from 'react';
import styled from 'styled-components';
import OwnerPortalMarket from './OwnerPortalMarket';
import DateTimePicker from 'react-datetime-picker';

const OwnerPortalContainer = styled.div`
`;
const ShowHideButton = styled.button``;

const OwnerPortal = ({markets, fluxProtocol, getAndUpdateMarkets}) => {
	const [description, setDescription] = useState('');
	const [endTime, setEndtime] = useState(new Date());
	const [show, toggleShow] = useState(false);


	const handleEvent = async (e) => {
		e.preventDefault();
		const res = await fluxProtocol.createMarket(description, endTime.getTime());
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
					<DateTimePicker
						value={endTime}
						onChange={setEndtime} 
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