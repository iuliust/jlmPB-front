import * as calls from '../actions/call';
import { WebSocketCallMessage } from '../../shared/_models';

export interface State {
    recentCalls: WebSocketCallMessage[];
}

const initialState: State = {
    recentCalls: [],
};

export function reducer(state: State = initialState, action: calls.Actions): State {
    switch (action.type) {
        case calls.ActionTypes.NEW_CALL:
            return {
                recentCalls: [...state.recentCalls, action.payload.call]
            };
        default:
            return state;
    }
}
