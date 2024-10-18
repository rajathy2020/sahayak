
// Define Action Types
export const INCREMENT = 'INCREMENT';
export const DECREMENT = 'DECREMENT';
export const SAVE_USER ='SAVE_USER';

// Action Creators

export const increment = () => {
    return {
        type: INCREMENT,
    };
};

export const decrement = () => {
    return {
        type: DECREMENT,
    };
};

export const saveUser = (our_users) => {
    return {
        type: SAVE_USER,
        users: our_users,
    };
};