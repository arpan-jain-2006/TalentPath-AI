import axios from "axios"

export const api = axios.create({
    baseURL: "https://talentpath-ai.onrender.com",
    withCredentials: true
})

// 👉 Interceptor: Har request ke header me token auto-attach karega
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token")
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
}, (error) => {
    return Promise.reject(error)
})

export async function register({ username, email, password }) {
    try {
        const response = await api.post('/api/auth/register', {
            username, email, password
        })
        if (response.data.token) {
            localStorage.setItem("token", response.data.token)
        }
        return response.data
    } catch (err) {
        console.error("Register API error:", err)
        throw err
    }
}

export async function login({ email, password }) {
    try {
        const response = await api.post("/api/auth/login", {
            email, password
        })
        if (response.data.token) {
            localStorage.setItem("token", response.data.token)
        }
        return response.data
    } catch (err) {
        console.error("Login API error:", err)
        throw err
    }
}

export async function logout() {
    try {
        localStorage.removeItem("token")
        const response = await api.get("/api/auth/logout")
        return response.data
    } catch (err) {
        console.error("Logout API error:", err)
        throw err
    }
}

export async function getMe() {
    try {
        const response = await api.get("/api/auth/get-me")
        return response.data
    } catch (err) {
        console.error("GetMe API error:", err)
        throw err
    }
}

export default api