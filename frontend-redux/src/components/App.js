import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { initialize } from '../actions/nearActions';
import { getMarkets } from '../actions/marketsActions';
import Header from './Header';
import Markets from './Markets';
import LoadingScreen from './LoadingScreen';
import OwnerPortal from './OwnerPortal';

function App({contract, dispatch, loading, owner, accountId}) {
  useEffect(() => {
    dispatch(initialize());
  }, []);

  useEffect(() => {
    if (contract) {
      dispatch(getMarkets(contract));
    } 
  })

  return (
    <div className="App">
      {
        loading 
        ?
        <LoadingScreen />
        :
        <>
          {(owner && accountId) && owner === accountId && <OwnerPortal/> }
          <Header />
          <Markets />
        </>
      }
    </div>
  );
}

const mapStateToProps = (state) => ({
  contract: state.near.contract,
  loading: state.near.loading,
  owner: state.near.owner,
  accountId: state.account.accountId
});


export default connect(mapStateToProps)(App);
