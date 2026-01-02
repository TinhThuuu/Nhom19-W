import React from 'react'
import { WrapperAllPrice, WrapperContentInfo, WrapperHeaderUser, WrapperInfoUser, WrapperItem, WrapperItemLabel, WrapperLabel, WrapperNameProduct, WrapperProduct, WrapperStyleContent } from './style'
import { useLocation, useParams } from 'react-router-dom'
import * as OrderService from '../../services/OrderService'
import { useQuery } from '@tanstack/react-query'
import { orderContant } from '../../contant'
import { convertPrice } from '../../utils'
import { useMemo } from 'react'
import Loading from '../../components/LoadingComponent/Loading'

const DetailsOrderPage = () => {
  const params = useParams()
  const location = useLocation()
  const { state } = location
  const { id } = params

  const fetchDetailsOrder = async () => {
    const res = await OrderService.getDetailsOrder(id, state?.token)
    return res.data
  }

  const queryOrder = useQuery({ 
    queryKey: ['orders-details', id], 
    queryFn: fetchDetailsOrder,
    enabled: !!id
  })
  
  const { isLoading, data } = queryOrder

  const priceMemo = useMemo(() => {
    const result = data?.orderItems?.reduce((total, cur) => {
      return total + ((cur.price * cur.amount))
    }, 0)
    return result
  }, [data])

  return (
    <Loading isLoading={isLoading}>
      <div style={{ width: '100%', minHeight: '100vh', background: '#f5f5fa', paddingBottom: '20px' }}>
        <div style={{ width: '1270px', margin: '0 auto' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '500', padding: '15px 0' }}>Chi tiết đơn hàng</h4>
          
          <WrapperHeaderUser>
            <WrapperInfoUser>
              <WrapperLabel>ĐỊA CHỈ NGƯỜI NHẬN</WrapperLabel>
              <WrapperContentInfo>
                <div className='name-info' style={{ fontWeight: 'bold' }}>{data?.shippingAddress?.fullName}</div>
                <div className='address-info'><span>Địa chỉ: </span> {`${data?.shippingAddress?.address}, ${data?.shippingAddress?.city}`}</div>
                <div className='phone-info'><span>Điện thoại: </span> {data?.shippingAddress?.phone}</div>
              </WrapperContentInfo>
            </WrapperInfoUser>
            <WrapperInfoUser>
              <WrapperLabel>HÌNH THỨC GIAO HÀNG</WrapperLabel>
              <WrapperContentInfo>
                <div className='delivery-info'><span className='name-delivery' style={{ color: 'orange', fontWeight: 'bold' }}>FAST </span>Giao hàng tiết kiệm</div>
                <div className='delivery-fee'><span>Phí giao hàng: </span> {data?.shippingPrice}</div>
              </WrapperContentInfo>
            </WrapperInfoUser>
            <WrapperInfoUser>
              <WrapperLabel>HÌNH THỨC THANH TOÁN</WrapperLabel>
              <WrapperContentInfo>
                <div className='payment-info'>{orderContant.payment[data?.paymentMethod]}</div>
                <div className='status-payment' style={{ color: 'orange', fontSize: '12px' }}>{data?.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}</div>
              </WrapperContentInfo>
            </WrapperInfoUser>
          </WrapperHeaderUser>

          <WrapperStyleContent style={{ background: '#fff', padding: '20px', borderRadius: '4px' }}>
            {/* Header: Cố định width từng cột để chống lệch */}
            <div style={{ display: 'flex', alignItems: 'center', fontWeight: '500', marginBottom: '15px' }}>
              <div style={{ width: '500px' }}>Sản phẩm</div>
              <div style={{ width: '200px', textAlign: 'center' }}>Giá</div>
              <div style={{ width: '150px', textAlign: 'center' }}>Số lượng</div>
              <div style={{ width: '200px', textAlign: 'right' }}>Giảm giá</div>
            </div>

            {/* List sản phẩm */}
            {data?.orderItems?.map((order, index) => {
              return (
                <div key={index} style={{ display: 'flex', alignItems: 'center', padding: '15px 0', borderTop: '1px solid #f0f0f0' }}>
                  <div style={{ width: '500px', display: 'flex', alignItems: 'center' }}>
                    <img src={order?.image} alt="product"
                      style={{ width: '70px', height: '70px', objectFit: 'cover', border: '1px solid #eee', padding: '2px' }}
                    />
                    <div style={{ marginLeft: '10px', fontSize: '14px' }}>{order?.name || 'Iphone 17'}</div>
                  </div>
                  <div style={{ width: '200px', textAlign: 'center', fontWeight: 'bold' }}>{convertPrice(order?.price)}</div>
                  <div style={{ width: '150px', textAlign: 'center' }}>{order?.amount}</div>
                  <div style={{ width: '200px', textAlign: 'right', color: 'red', fontWeight: 'bold' }}>
                    {order?.discount ? convertPrice((order.price * order.amount) * order.discount / 100) : '0 VND'}
                  </div>
                </div>
              )
            })}
            
            {/* Khung tổng cộng đẹp */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginTop: '30px' }}>
              <div style={{ 
                width: '380px', 
                border: '1px solid #eee', 
                padding: '20px', 
                borderRadius: '12px', 
                background: '#fff',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#888' }}>Tạm tính</span>
                  <span style={{ color: 'red', fontWeight: '500' }}>{convertPrice(priceMemo)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  <span style={{ color: '#888' }}>Phí vận chuyển</span>
                  <span style={{ color: 'red', fontWeight: '500' }}>{convertPrice(data?.shippingPrice)}</span>
                </div>
                <div style={{ borderTop: '1px solid #eee', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Tổng cộng</span>
                  <span style={{ color: 'red', fontSize: '24px', fontWeight: 'bold' }}>{convertPrice(data?.totalPrice)}</span>
                </div>
              </div>
            </div>
          </WrapperStyleContent>
        </div>
      </div>
    </Loading>
  )
}

export default DetailsOrderPage