import React from 'react';
import Switch from "react-switch";
import styled from 'styled-components';

const OrderTypeToggle = styled(Switch)`
  float: right;
`;

const OrderTypeToggleSection = styled.div`
  margin-bottom: 18px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.4);
  padding-bottom: 12px;
`;

const Label = styled.div`
  vertical-align: middle;
  display: inline;
`;

const orderTypeToggle = (props) => {
	const {toggleOrderType, orderType} = props;
	return (
    <OrderTypeToggleSection>
      <Label>{ orderType === "limit" ? "Limit order" : "Market order"}</Label>
      <OrderTypeToggle 
        checkedIcon={false} 
        uncheckedIcon={false}
        onColor="#5400FF"
        offColor="#FF009C"
        onChange={toggleOrderType} 
        checked={orderType === "limit"} 
      />
    </OrderTypeToggleSection>
	)
}

export default orderTypeToggle;