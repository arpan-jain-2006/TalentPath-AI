import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import React from 'react';

const Protected = ({ children }) => {
    const { loading, user, authInitialized } = useAuth();

    if (!authInitialized || (loading && !user)) {
        return (
            <div className="protected-loader-screen">
                <div className="protected-spinner"></div>
                <p>Verifying session...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }
    
    return children;
};

export default Protected;