import React, { createContext, useContext, useState } from 'react';

// Create a Context
const TaskFormContext = createContext();

// Create a Provider component
export const TaskFormProvider = ({ children }) => {
    const [taskFormData, setTaskFormData] = useState(null);

    return (
        <TaskFormContext.Provider value={{ taskFormData, setTaskFormData }}>
            {children}
        </TaskFormContext.Provider>
    );
};

// Custom hook to use the TaskFormContext
export const useTaskForm = () => {
    return useContext(TaskFormContext);
}; 