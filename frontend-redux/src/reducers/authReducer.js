import { GET_AUTH_STATUS_BEGIN, GET_AUTH_STATUS_SUCCESS, GET_AUTH_STATUS_FAILURE } from "../actions/authActions"

const initialState = {
	loading: false,
	success: null,
	error: null
}

export default function authReducer(state = initialState, action) {
	switch(action.type) {
		case GET_AUTH_STATUS_BEGIN:
			return {
				success: null,
				loading: true,
				error: null,
			}
		case GET_AUTH_STATUS_SUCCESS:
			return {
				success: action.payload.allowed,
				loading: false,
				error: null,
			}
		case GET_AUTH_STATUS_FAILURE:
			return {
				success: false,
				loading: false,
				error: action.payload.err
			}
		default: 
			return state;
	}
}