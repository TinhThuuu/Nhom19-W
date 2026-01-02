import axios from "axios"

// ================= AXIOS INSTANCE =================
export const axiosJWT = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
})

// ================= REQUEST INTERCEPTOR =================
axiosJWT.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token")
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// ================= RESPONSE INTERCEPTOR (OPTIONAL – KHÔNG TỰ REFRESH) =================
axiosJWT.interceptors.response.use(
    (response) => response,
    (error) => {
        return Promise.reject(error)
    }
)

// ================= AUTH =================
export const loginUser = async (data) => {
    const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/user/sign-in`,
        data
    )
    return res.data
}

export const signupUser = async (data) => {
    const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/user/sign-up`,
        data
    )
    return res.data
}

export const logoutUser = async () => {
    const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/user/log-out`
    )
    return res.data
}

// ================= USER =================
export const getDetailsUser = async (id) => {
    const res = await axiosJWT.get(`/user/get-details/${id}`)
    return res.data
}

export const updateUser = async (id, data) => {
    const res = await axiosJWT.put(`/user/update-user/${id}`, data)
    return res.data
}

export const deleteUser = async (id) => {
    const res = await axiosJWT.delete(`/user/delete-user/${id}`)
    return res.data
}

export const getAllUser = async () => {
    const res = await axiosJWT.get(`/user/getAll`)
    return res.data
}

export const deleteManyUser = async (data) => {
    const res = await axiosJWT.post(`/user/delete-many`, data)
    return res.data
}

// ================= REFRESH TOKEN =================
export const refreshToken = async () => {
    const refresh_token = localStorage.getItem("refresh_token")
    const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/user/refresh-token`,
        {},
        {
            headers: {
                Authorization: `Bearer ${refresh_token}`,
            },
        }
    )
    return res.data
}
