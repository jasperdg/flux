
import { 
	GOT_MARKETS
} from "../actions/marketsActions";

const initialState = {
	markets: []
}

export default function fluxProtocolReducer(state = initialState, action) {
	switch(action.type) {
		case GOT_MARKETS: 
			return {
				...state,
				markets: action.payload.markets
			}
		default: 
			return state;
	}
}