import axios from "axios"

// Auto-detect environment: use localhost for fast local dev, or production Render URL
const getBaseUrl = () => {
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL
    if (typeof window !== "undefined") {
        const host = window.location.hostname
        if (host === "localhost" || host === "127.0.0.1") {
            return "http://localhost:3000"
        }
    }
    return "https://talentpath-ai.onrender.com"
}

export const api = axios.create({
    baseURL: getBaseUrl(),
    withCredentials: true,
    timeout: 90000 // 90s timeout for AI generation endpoints
})

// Interceptor: Auto attach Bearer token to all requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token")
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
}, (error) => {
    return Promise.reject(error)
})

// Interceptor: Handle auth expiration
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && !error.config.url.includes("/api/auth/login")) {
            localStorage.removeItem("token")
        }
        return Promise.reject(error)
    }
)

export async function register({ username, email, password }) {
    try {
        const response = await api.post('/api/auth/register', {
            username, email, password
        })
        if (response.data?.token) {
            localStorage.setItem("token", response.data.token)
        }
        return response.data
    } catch (err) {
        const msg = err.response?.data?.message || err.message || "Registration failed"
        console.error("Register API error:", msg)
        throw new Error(msg)
    }
}

export async function login({ email, password }) {
    try {
        const response = await api.post("/api/auth/login", {
            email, password
        })
        if (response.data?.token) {
            localStorage.setItem("token", response.data.token)
        }
        return response.data
    } catch (err) {
        const msg = err.response?.data?.message || err.message || "Invalid email or password"
        console.error("Login API error:", msg)
        throw new Error(msg)
    }
}

export async function logout() {
    try {
        localStorage.removeItem("token")
        const response = await api.get("/api/auth/logout")
        return response.data
    } catch (err) {
        localStorage.removeItem("token")
        console.error("Logout API error:", err)
        return { message: "Logged out locally" }
    }
}

export async function getMe() {
    try {
        const response = await api.get("/api/auth/get-me")
        return response.data
    } catch (err) {
        console.error("GetMe API error:", err.response?.data?.message || err.message)
        throw err
    }
}

export default api