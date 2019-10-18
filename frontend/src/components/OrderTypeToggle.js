import React from 'react';
import Switch from "react-switch";

const orderTypeToggle = (props) => {
	const {toggleOrderType, orderType} = props;
	return (
		<div>
			<div className="order-type-toggle-section">
              <label>{ orderType === "limit" ? "Limit order" : "Market order"}</label>
              <Switch 
                checkedIcon={false} 
                uncheckedIcon={false}
                className="order-type-toggle"
                onColor="#5400FF"
                offColor="#FF009C"
                onChange={toggleOrderType} 
                checked={orderType === "limit"} 
              />
            </div>
		</div>
	)
}

export default orderTypeToggle;