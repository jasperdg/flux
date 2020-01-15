import React, { useEffect } from 'react';
import App from './App';
import { connect } from 'react-redux';
import { getAuthStatus } from '../actions/authActions';
import isMobileDevice from '../utils/isMobileDevice';
import DesktopSplash from './DesktopSplash';
import LoadingScreen from './LoadingScreen';
import { initialize } from '../actions/nearActions';

function Authenticate({dispatch, walletAccount, success, loading, error,...props}) {
	useEffect(() => {
		dispatch(initialize());
	}, []);
	
	// dispatch(getAuthStatus(walletAccount, props.match.params.accessToken));
	// console.log(walletAccount);
	const mobile = isMobileDevice();
	if (loading) return <LoadingScreen />;
	if (!mobile) return <DesktopSplash />;
	if (success) return <App />;
	else return <div>denied</div>
}

const mapStateToProps = state => ({
	walletAccount: state.near.walletAccount,
	success: state.auth.success,
	loading: state.auth.loading,
	error: state.auth.error,
})


export default connect(mapStateToProps)(Authenticate);
