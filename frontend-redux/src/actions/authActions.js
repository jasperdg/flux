import { API_URL } from './../constants';

export const GET_AUTH_STATUS_BEGIN = 'GET_AUTH_STATUS_BEGIN';
export const GET_AUTH_STATUS_SUCCESS = 'GET_AUTH_STATUS_SUCCESS';
export const GET_AUTH_STATUS_FAILURE = 'GET_AUTH_STATUS_FAILURE';

export const getAuthStatusBegin = () => ({
	type: GET_AUTH_STATUS_BEGIN
});

export const authStatusSuccess = allowed => ({
	type: GET_AUTH_STATUS_SUCCESS,
	payload: {
		allowed
	}
});

export const authStatusFailure = err => ({
	type: GET_AUTH_STATUS_FAILURE,
	payload: {
		err
	}
});

export const getAuthStatus = (accessToken) => {
	return dispatch => {
		dispatch(getAuthStatusBegin());
		return fetch(`${API_URL}/check_auth`, {
			mode: 'cors',
			credentials: 'include'
		})
		.then(res => res.json())
		.then(json => {
			const { success } = json;
			if (success) dispatch(authStatusSuccess(success));
			else checkAccessToken(accessToken, dispatch);
			return success;
		})
		.catch(err => dispatch(authStatusFailure(err)));
	}
}

const checkAccessToken = (accessToken, dispatch) => {
	fetch(`${API_URL}/auth`, {
		method: "POST",
		mode: 'cors',
		cache: 'no-cache',
		credentials: "include",
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({accessToken}),
	})
	.then(res => res.json())
	.then(json => {
		const { success } = json;
		dispatch(authStatusSuccess(success));
	})
	.catch(err => dispatch(authStatusFailure(err)))

}