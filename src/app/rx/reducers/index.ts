import { ActionReducer, combineReducers } from '@ngrx/store';
import * as fromAchievements from './achievements.reducer';
import * as fromCalls from './call.reducer';

export interface RootState {
    achievements: fromAchievements.State;
    calls: fromCalls.State;
}

const reducers = {
    achievements: fromAchievements.reducer,
    calls: fromCalls.reducer
};

const developmentReducer: ActionReducer<RootState> = combineReducers(reducers);

export function reducer(state: any, action: any) {
    return developmentReducer(state, action);
}

export const getCallsState = (state: RootState) => state.calls;
export const getAchievementsState = (state: RootState) => state.achievements;
