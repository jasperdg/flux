import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { initialize } from '../actions/nearActions';
import { getMarkets } from '../actions/marketsActions';
import Header from './Header';
import Markets from './Markets';
// TODO: Remove account from nearReducer and create own subset of actions/reductions for each account
// TODO: Create Order and Market Objects for redux, input-state etc. is now being shared amongst markets -> this shouldn't be the case
function App({contract, dispatch}) {
  useEffect(() => {
    dispatch(initialize());
  }, []);

  useEffect(() => {
    if (contract) {
      dispatch(getMarkets(contract));
      // get for owner and check if owner is equal to account?
    } 
  })

  return (
    <div className="App">
      <Header />
      <Markets />
    </div>
  );
}

const mapStateToProps = (state) => ({
  contract: state.near.contract,
});


export default connect(mapStateToProps)(App);
