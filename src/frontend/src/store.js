import {createStore, combineReducers, compose } from 'redux';
import { INCREMENT, DECREMENT, SAVE_USER } from './action';
import { createUser } from './models.ts';


const composeEnchancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__|| compose ;
const initialState = {
    count:0,
};

const counterReducer = (state = initialState, action) => {
    switch (action.type) {
        case INCREMENT:
            return { ...state, count: state.count + 10};
        case DECREMENT:
            return { ...state, count: state.count - 1};
        default:
            return state;
    }
};

const userInitialState = {
    users: [createUser()]
}

const userReducer = (state = userInitialState, action) => {
    switch (action.type) {
        case SAVE_USER:
            const x = { ...state, users: action.users};
            return x;
        default:
            return state;
    }
};

const rootReducer = combineReducers(
    {
        counter: counterReducer,
        users: userReducer,
    }
)

const store = createStore(rootReducer, composeEnchancers());

export default store;