import React, { useEffect, useState } from 'react';
import App from '../App';
import { connect } from 'react-redux';
import { getAuthStatus } from '../../actions/authActions';
import isMobileDevice from '../../utils/isMobileDevice';
import DesktopSplash from '../DesktopSplash';
import LoadingScreen from '../LoadingScreen';
import { initialize } from '../../actions/nearActions';
import NearLogin from './NearLogin';
import { signIn } from '../../actions/accountActions';
import EnterAccessToken from './EnterAccessToken';

function Authenticate({dispatch, invalidAccessToken, signedIn, walletAccount, success, loading, error,...props}) {
	const [authenticated, setAuthenticated] = useState(false);

	useEffect(() => {
		dispatch(initialize());
	}, []);

	if (!authenticated && walletAccount) {
		dispatch(getAuthStatus(walletAccount, props.match.params.accessToken));
		setAuthenticated(true)
	}

	const mobile = isMobileDevice();
	if (!mobile) return <DesktopSplash />;
	if (loading) return <LoadingScreen />;
	if (signedIn === false) return <NearLogin login={() => signIn(walletAccount)}/>
	if (invalidAccessToken) return <EnterAccessToken accountId={walletAccount.getAccountId()}/>
	if (success) return <App />;
	else return <div>denied</div>
}

const mapStateToProps = state => ({
	walletAccount: state.near.walletAccount,
	success: state.auth.success,
	loading: state.auth.loading,
	error: state.auth.error,
	signedIn: state.auth.signedIn,
	invalidAccessToken: state.auth.invalidAccessToken,
})


export default connect(mapStateToProps)(Authenticate);
