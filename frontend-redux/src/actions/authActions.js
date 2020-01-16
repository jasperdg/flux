import { API_URL } from './../constants';

export const GET_AUTH_STATUS_BEGIN = 'GET_AUTH_STATUS_BEGIN';
export const GET_AUTH_STATUS_SUCCESS = 'GET_AUTH_STATUS_SUCCESS';
export const GET_AUTH_STATUS_FAILURE = 'GET_AUTH_STATUS_FAILURE';
export const SIGNED_IN = 'SIGNED_IN';
export const 	INVALID_ACCESS_TOKEN = '	INVALID_ACCESS_TOKEN';

export const invalidAccessToken = () => ({
	type: INVALID_ACCESS_TOKEN
})

export const getAuthStatusBegin = () => ({
	type: GET_AUTH_STATUS_BEGIN
});

export const authStatusSuccess = allowed => ({
	type: GET_AUTH_STATUS_SUCCESS,
	payload: {

		allowed
	}
});

export const signedIn = signedIn => ({
	type: SIGNED_IN, 
	payload: {
		signedIn
	}
});

export const authStatusFailure = err => ({
	type: GET_AUTH_STATUS_FAILURE,
	payload: {
		err
	}
});

export const getAuthStatus = (walletAccount, accessToken) => {
	return dispatch => {
		dispatch(getAuthStatusBegin());
		if (walletAccount) {
			const isSignedIn = walletAccount.isSignedIn();
			const accountId = walletAccount.getAccountId();

			dispatch(signedIn(isSignedIn));
			if (isSignedIn) {
				return fetch(`${API_URL}/auth_near_account`, {
					method: "POST",
					mode: 'cors',
					cache: 'no-cache',
					credentials: "include",
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({accountId}),
				})
				.then(res => res.json())
				.then(json => {
					const { success } = json;
					if (success) dispatch(authStatusSuccess(success));
					else dispatch(checkAccessToken(accessToken, accountId));
					return success;
				})
				.catch(err => dispatch(authStatusFailure(err)));
			} else {
				dispatch(authStatusSuccess(false))
				return
			}
		}
	}
}

export const checkAccessToken = (accessToken, accountId) => {
	return dispatch => {
		if (!accessToken) return dispatch(invalidAccessToken());
		fetch(`${API_URL}/auth_user`, {
			method: "POST",
			mode: 'cors',
			cache: 'no-cache',
			credentials: "include",
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({accessToken, accountId}),
		})
		.then(res => res.json())
		.then(json => {
			const { success } = json;
			if (success) {
				dispatch(authStatusSuccess(success));
			} else {
				dispatch(invalidAccessToken());
			}
		})
		.catch(err => {
			dispatch(authStatusFailure(err))
		})
	}

}