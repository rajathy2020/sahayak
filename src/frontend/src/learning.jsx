import React, { useState, useEffect } from 'react';
import { fetchusers } from './api';
import { useSelector, useDispatch } from 'react-redux';
import { saveUser } from './action';

function User(props) {
    return (
        <div>
            <h1>Users</h1>
            <ul>
                {
                    props.data.map((user) => (
                        <li key={user.id}>
                            <h2>{user.name}</h2>
                            <p>{user.email}</p>
                        </li>
                    ))
                }
            </ul>
        </div>
    );
}

function Counter() {
    const count = useSelector((state) => state.count);
    const users = useSelector((state) => state.users.users); // Select all users from the Redux store

    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Function to fetch users
    const getUsers = async () => {
        try {
            return await fetchusers();
        } catch (error) {
            setError('Failed to get users');
        } finally {
            setLoading(false);
        }
    };

    // Fetch users and save them to the Redux store when the component mounts
    useEffect(() => {
        const fetchAndSaveUsers = async () => {
            const data = await getUsers();
            if (data && data.length > 0) {
                dispatch(saveUser(data)); // Save the list of users to the Redux store
            }
        };

        fetchAndSaveUsers();
    }, [dispatch]); // Use `dispatch` as the dependency


    return (
        <div>
            <div>{count}</div>
            {loading ? <p>Loading...</p> : <User data={users}></User>}
            {error && <p>{error}</p>}
        </div>
    );
}

export default Counter;