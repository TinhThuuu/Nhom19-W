import { axiosJWT } from "./UserService"

// ================= CREATE ORDER =================
export const createOrder = async (data, access_token) => {
    const res = await axiosJWT.post(
        `${process.env.REACT_APP_API_URL}/order/create`,
        data,
        {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        }
    )
    return res.data
}

// ================= GET ORDER BY USER =================
export const getOrderByUserId = async (id, access_token) => {
    const res = await axiosJWT.get(
        `${process.env.REACT_APP_API_URL}/order/get-all-order/${id}`,
        {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        }
    )
    return res.data
}

// ================= GET ORDER DETAILS =================
export const getDetailsOrder = async (id, access_token) => {
    const res = await axiosJWT.get(
        `${process.env.REACT_APP_API_URL}/order/get-details-order/${id}`,
        {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        }
    )
    return res.data
}

// ================= CANCEL ORDER =================
export const cancelOrder = async (id, access_token, orderItems, userId) => {
    const res = await axiosJWT.delete(
        `${process.env.REACT_APP_API_URL}/order/cancel-order/${userId}`,
        {
            data: {
                orderItems,
                orderId: id,
            },
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        }
    )
    return res.data
}

// ================= ADMIN GET ALL =================
export const getAllOrder = async (access_token) => {
    const res = await axiosJWT.get(
        `${process.env.REACT_APP_API_URL}/order/get-all-order`,
        {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        }
    )
    return res.data
}
