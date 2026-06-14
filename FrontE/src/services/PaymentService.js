import axios from "axios"

// Verify VNPay return (no auth required)
export const verifyVNPayReturn = async (queryString) => {
  // allow queryString that already contains leading '?' or not
  const qs = queryString && queryString.startsWith('?') ? queryString : (queryString ? `?${queryString}` : '')
  const url = `${process.env.REACT_APP_API_URL}/payment/vnpay-return${qs}`
  console.log('VNPay return verify request url:', url)
  const res = await axios.get(url)
  return res.data
}

export const getConfig = async () => {
  const res = await axios.get(`${process.env.REACT_APP_API_URL}/payment/config`)
  return res.data
}

export const createVNPayPayment = async (orderId, amount, returnUrl, access_token) => {
  const res = await axios.post(
    `${process.env.REACT_APP_API_URL}/payment/vnpay/create-payment`,
    { orderId, amount, returnUrl },
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  )
  return res.data
}

export const checkPayment = async (orderId, access_token) => {
  const url = `${process.env.REACT_APP_API_URL}/payment/check/${orderId}`
  const res = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  })
  return res.data
}