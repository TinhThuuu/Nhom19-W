import axios from "axios"
import { axiosJWT } from "./UserService"

// ================= PUBLIC =================
export const getAllProduct = async (search, limit, page, sort, filter) => {
    const params = []
    if (limit) params.push(`limit=${limit}`)
    if (typeof page !== 'undefined' && page !== null) params.push(`page=${page}`)
    if (search) params.push(`filter=name&filter=${encodeURIComponent(search)}`)
    if (sort) params.push(`sort=${sort}`)
    if (filter) params.push(`filter=${encodeURIComponent(filter)}`)

    const query = params.length ? `?${params.join('&')}` : ''
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/product/get-all${query}`)
    return res.data
}

export const getProductType = async (type, page, limit) => {
    if (type) {
        const res = await axios.get(
            `${process.env.REACT_APP_API_URL}/product/get-all?filter=type&filter=${type}&limit=${limit}&page=${page}`
        )
        return res.data
    }
}

export const getDetailsProduct = async (id) => {
    const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/product/get-details/${id}`
    )
    return res.data
}

export const getAllTypeProduct = async () => {
    const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/product/get-all-type`
    )
    return res.data
}

// ================= REVIEWS =================
export const postProductReview = async (productId, data) => {
    const res = await axiosJWT.post(`/product/review/${productId}`, data)
    return res.data
}

// ================= ADMIN =================
export const createProduct = async (data, access_token) => {
    const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/product/create`,
        data,
        {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        }
    )
    return res.data
}

export const updateProduct = async (id, access_token, data) => {
    const res = await axiosJWT.put(
        `${process.env.REACT_APP_API_URL}/product/update/${id}`,
        data,
        {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        }
    )
    return res.data
}

export const deleteProduct = async (id, access_token) => {
    const res = await axiosJWT.delete(
        `${process.env.REACT_APP_API_URL}/product/delete/${id}`,
        {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        }
    )
    return res.data
}

export const deleteManyProduct = async (data, access_token) => {
    const res = await axiosJWT.post(
        `${process.env.REACT_APP_API_URL}/product/delete-many`,
        data,
        {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        }
    )
    return res.data
}
