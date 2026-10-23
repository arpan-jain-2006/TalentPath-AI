import { useContext } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout } from "../services/auth.api";

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    const { user, setUser, loading, setLoading, authInitialized } = context;

    const handleLogin = async ({ email, password }) => {
        setLoading(true);
        try {
            const data = await login({ email, password });
            setUser(data.user);
            return { success: true, user: data.user };
        } catch (err) {
            console.error("Login failed:", err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true);
        try {
            const data = await register({ username, email, password });
            setUser(data.user);
            return { success: true, user: data.user };
        } catch (err) {
            console.error("Registration failed:", err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoading(true);
        try {
            await logout();
        } catch (err) {
            console.error("Logout error:", err.message);
        } finally {
            setUser(null);
            setLoading(false);
        }
    };

    return { 
        user, 
        setUser,
        loading, 
        authInitialized,
        handleRegister, 
        handleLogin, 
        handleLogout 
    };
};