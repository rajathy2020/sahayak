import React, { createContext, useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchUserInfo } from './api'; // Adjust the import path as necessary

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const location = useLocation(); // Hook to get the current route

  const fetchUser = async () => {
    try {
      const userInfo = await fetchUserInfo();
      setUser(userInfo);
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  // Fetch user info when the component mounts or when the route changes
  useEffect(() => {
    fetchUser();
  }, [location]); // Re-fetch user info on route change

  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};
