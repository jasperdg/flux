import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { initialize } from '../actions/nearActions';
import { getMarkets } from '../actions/marketsActions';
import Header from './Header';
import Markets from './Markets';
import LoadingScreen from './LoadingScreen';
import OwnerPortal from './OwnerPortal';
import Loader from './Loader';

function App({contract, dispatch, loading, owner, accountId}) {
  useEffect(() => {
    if (contract) {
      dispatch(getMarkets(contract));
    } 
  })

  // const authData = JSON.parse(window.localStorage.getItem(this._authDataKey) || '{}');
  // console.log(authData);
  console.log(window.localStorage);
  return (
    <div className="App">
      {
        loading 
        ?
        <LoadingScreen />
        :
        <>
          <Loader/>
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
