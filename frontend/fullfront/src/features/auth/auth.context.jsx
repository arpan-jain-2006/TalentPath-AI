import { createContext, useState, useEffect } from "react";
import { getMe } from "./services/auth.api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => { 
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authInitialized, setAuthInitialized] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const checkAuthSession = async () => {
            const token = localStorage.getItem("token");
            try {
                const data = await getMe();
                if (isMounted && data?.user) {
                    setUser(data.user);
                }
            } catch (err) {
                if (isMounted) {
                    setUser(null);
                    if (token) {
                        localStorage.removeItem("token");
                    }
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                    setAuthInitialized(true);
                }
            }
        };

        checkAuthSession();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading, setLoading, authInitialized }}>
            {children}
        </AuthContext.Provider>
    );
};