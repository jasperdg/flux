
import { 
	INIT
} from "../actions/nearActions";

const initialState = {
	near: null,
	contract: null,
	walletAccount: null,
}

export default function nearReducer(state = initialState, action) {
	switch(action.type) {
		case INIT: 
			return {
				...state,
				near: action.payload.near,
				walletAccount: action.payload.walletAccount,
				contract: action.payload.contract,
			}
		default: 
			return state;
	}
}