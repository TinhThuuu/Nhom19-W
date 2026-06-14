import React from 'react'
import { Lable, WrapperInfo, WrapperContainer, WrapperValue, WrapperCountOrder, WrapperItemOrder, WrapperItemOrderInfo } from './style';
import Loading from '../../components/LoadingComponent/Loading';
import { useLocation } from 'react-router-dom';
import { orderContant } from '../../contant';
import { convertPrice } from '../../utils';

const OrderSucess = () => {
  const location = useLocation()
  const { state } = location

  return (
    <div style={{ background: '#f5f5fa', width: '100%', minHeight: '100vh', paddingBottom: '20px' }}>
      <Loading isLoading={false}>
        <div style={{ width: '1270px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '500', padding: '15px 0' }}>Đơn đặt hàng</h3>
          
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <WrapperContainer style={{ width: '100%', background: '#fff', padding: '20px', borderRadius: '4px' }}>
              
              {/* PHẦN THÔNG TIN VẬN CHUYỂN & THANH TOÁN */}
              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <WrapperInfo style={{ flex: 1, padding: '15px', border: '1px solid #eee', borderRadius: '8px', background: '#fafafa' }}>
                  <Lable style={{ marginBottom: '10px', display: 'block', fontWeight: 'bold' }}>Phương thức giao hàng</Lable>
                  <WrapperValue>
                    <span style={{ color: '#ea8500', fontWeight: 'bold' }}>
                      {orderContant.delivery[state?.delivery]}
                    </span> Giao hàng tiết kiệm
                  </WrapperValue>
                </WrapperInfo>

                <WrapperInfo style={{ flex: 1, padding: '15px', border: '1px solid #eee', borderRadius: '8px', background: '#fafafa' }}>
                  <Lable style={{ marginBottom: '10px', display: 'block', fontWeight: 'bold' }}>Phương thức thanh toán</Lable>
                  <WrapperValue>
                    {orderContant.payment[state?.payment]}
                  </WrapperValue>
                </WrapperInfo>
              </div>

              <WrapperItemOrderInfo style={{ borderTop: '1px solid #f0f0f0', paddingTop: '10px' }}>
                {state?.orders?.map((order) => {
                  return (
                    <WrapperItemOrder key={order?.name} style={{ display: 'flex', alignItems: 'center', padding: '15px 0', borderBottom: '1px dotted #eee' }}>
                      <div style={{ width: '500px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <img 
                          src={order.image} 
                          alt="product"
                          style={{ width: '77px', height: '79px', objectFit: 'cover', border: '1px solid #eee', padding: '2px', borderRadius: '4px' }} 
                        />
                        <div style={{
                          width: '350px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontWeight: '500'
                        }}>{order?.name}</div>
                      </div>

                      {/* Cột thông tin giá và số lượng: Căn lề thẳng hàng */}
                      <div style={{ flex: 1, display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                        <div style={{ width: '150px', textAlign: 'center' }}>
                          <span style={{ fontSize: '14px', color: '#242424' }}>Giá tiền: <strong>{convertPrice(order?.price)}</strong></span>
                        </div>
                        <div style={{ width: '100px', textAlign: 'center' }}>
                          <span style={{ fontSize: '14px', color: '#242424' }}>Số lượng: <strong>{order?.amount}</strong></span>
                        </div>
                      </div>
                    </WrapperItemOrder>
                  )
                })}
              </WrapperItemOrderInfo>

              {/* KHUNG TỔNG TIỀN TRỰC TIẾP */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginTop: '20px' }}>
                <div style={{ 
                  width: '320px', 
                  border: '1px solid #ff424e', 
                  padding: '15px', 
                  borderRadius: '12px', 
                  background: '#fff5f5', /* Nền hồng nhạt cho nổi bật */
                  textAlign: 'right'
                }}>
                  <div style={{ fontSize: '15px', color: '#555', marginBottom: '5px' }}>Tổng thanh toán</div>
                  <div style={{ fontSize: '22px', color: '#ff424e', fontWeight: 'bold' }}>
                    {convertPrice(state?.totalPriceMemo)}
                  </div>
                </div>
              </div>

            </WrapperContainer>
          </div>
        </div>
      </Loading>
    </div>
  )
}

export default OrderSucess