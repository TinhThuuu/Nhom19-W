
import React, { useEffect, useState } from 'react'
import * as PaymentService from '../../services/PaymentService'
import Loading from '../../components/LoadingComponent/Loading'
import ButtonComponent from '../../components/ButtonComponent/ButtonComponent'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { removeAllOrderProduct } from '../../redux/slides/orderSlide'

const PaymentVNPayReturn = () => {

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [status, setStatus] = useState('loading')
  const [messageText, setMessageText] = useState('Đang kiểm tra trạng thái thanh toán...')
  const [attempt, setAttempt] = useState(0)


  useEffect(() => {
    const verifyReturn = async () => {
      try {
        const queryString = window.location.search
        console.log('VNPay return queryString:', queryString)
        if (!queryString || queryString.length <= 1) {
          setStatus('failed')
          setMessageText('Không có thông tin thanh toán từ VNPay')
          return
        }
        const res = await PaymentService.verifyVNPayReturn(queryString)
        if (res?.status === 'OK') {
          const data = res.data
          console.log('VNPay return response:', res)
          if (data?.isPaid || data?.paymentStatus === 'paid') {
            setStatus('success')
            setMessageText('Thanh toán thành công')
            if (data?.orderId) localStorage.setItem('vnpay_orderId', data.orderId)
            
            // Clear cart items
            try {
              const orderedItemsStr = localStorage.getItem('vnpay_ordered_items')
              if (orderedItemsStr) {
                const orderedItems = JSON.parse(orderedItemsStr)
                dispatch(removeAllOrderProduct({ listChecked: orderedItems }))
                localStorage.removeItem('vnpay_ordered_items')
              }
            } catch (err) {
              console.error('Failed to clear cart after VNPay payment:', err)
            }
          } else if (data?.paymentStatus === 'pending') {
            setStatus('loading')
            setMessageText('Thanh toán đang chờ xử lý')
          } else {
            setStatus('failed')
            setMessageText('Thanh toán thất bại')
          }
        } else {
          setStatus('failed')
          setMessageText(res?.message || 'Không thể xác minh kết quả thanh toán. Vui lòng kiểm tra lại đơn hàng.')
        }
      } catch (e) {
        console.error('verifyVNPayReturn error:', e.response?.data || e.message || e)
        const message = e.response?.data?.message || e.response?.data?.Message || 'Không thể xác minh kết quả thanh toán. Vui lòng kiểm tra lại đơn hàng.'
        setStatus('failed')
        setMessageText(message)
      }
    }
    verifyReturn()
  }, [attempt])


  const handleViewOrder = () => {
    const orderId = localStorage.getItem('vnpay_orderId')
    if (orderId) navigate(`/details-order/${orderId}`)
    else navigate('/my-order')
  }

  const handleHome = () => {
    navigate('/')
  }

  return (
    <div style={{padding: 20}}>
      <Loading isLoading={status === 'loading'}>
        <h3>{messageText}</h3>
        <div style={{display: 'flex', gap: 12, marginTop: 20}}>
          <ButtonComponent onClick={() => setAttempt(attempt + 1)} textbutton={'Kiểm tra lại'} />
          <ButtonComponent onClick={handleViewOrder} textbutton={'Xem đơn hàng'} />
          <ButtonComponent onClick={handleHome} textbutton={'Về trang chủ'} />
        </div>
      </Loading>
    </div>
  )
}

export default PaymentVNPayReturn
