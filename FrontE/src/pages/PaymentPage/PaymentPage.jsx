import {Form, Radio } from 'antd'
import React, { useEffect, useState } from 'react'
import { Lable, WrapperInfo, WrapperLeft, WrapperRadio, WrapperRight, WrapperTotal } from './style';

import ButtonComponent from '../../components/ButtonComponent/ButtonComponent';
import { useDispatch, useSelector } from 'react-redux';
import { convertPrice } from '../../utils';
import { useMemo } from 'react';
import ModalComponent from '../../components/ModalComponent/ModalComponent';
import InputComponent from '../../components/InputComponent/InputComponent';
import { useMutationHooks } from '../../hooks/useMutationHook';
import * as  UserService from '../../services/UserService'
import * as OrderService from '../../services/OrderService'
import Loading from '../../components/LoadingComponent/Loading';
import * as message from '../../components/Message/Message'
import { updateUser } from '../../redux/slides/userSlide';
import { useNavigate } from 'react-router-dom';
import { removeAllOrderProduct } from '../../redux/slides/orderSlide';
// import { PayPalButton } from "react-paypal-button-v2";
import * as PaymentService from '../../services/PaymentService'


const PaymentPage = () => {
  const order = useSelector((state) => state.order)
  const user = useSelector((state) => state.user)

  const [delivery, setDelivery] = useState('fast') // 'fast' hoặc 'ghtk'
  const [payment, setPayment] = useState('later_money')
  const [loadingOrder, setLoadingOrder] = useState(false)
  const [processingMsg, setProcessingMsg] = useState('')
  const [outOfStockMsg, setOutOfStockMsg] = useState('')
  const [highlightedProducts, setHighlightedProducts] = useState([])
  const navigate = useNavigate()

  const [isOpenModalUpdateInfo, setIsOpenModalUpdateInfo] = useState(false)
  const [stateUserDetails, setStateUserDetails] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    email: ''
  })
  const [form] = Form.useForm();

  const dispatch = useDispatch()


  useEffect(() => {
    form.setFieldsValue(stateUserDetails)
  }, [form, stateUserDetails])

  useEffect(() => {
    if(isOpenModalUpdateInfo) {
      setStateUserDetails({
        city: user?.city,
        name: user?.name,
        address: user?.address,
        phone: user?.phone,
        email: user?.email || ''
      })
    }
  }, [isOpenModalUpdateInfo, user])

  const handleChangeAddress = () => {
    setIsOpenModalUpdateInfo(true)
  }

  const priceMemo = useMemo(() => {
    const result = order?.orderItemsSlected?.reduce((total, cur) => {
      return total + ((cur.price * cur.amount))
    },0)
    return result
  },[order])

  const priceDiscountMemo = useMemo(() => {
    const result = order?.orderItemsSlected?.reduce((total, cur) => {
      const discount = cur.discount || 0
      return total + (cur.price * cur.amount * discount) / 100
    }, 0)
    return result || 0
  }, [order])

  // Phí ship động theo phương thức giao hàng
  const diliveryPriceMemo = useMemo(() => {
    if (delivery === 'fast') return 33000;
    if (delivery === 'ghtk') return 22000;
    return 0;
  }, [delivery]);

  const totalPriceMemo = useMemo(() => {
    return Number(priceMemo) - Number(priceDiscountMemo) + Number(diliveryPriceMemo)
  },[priceMemo,priceDiscountMemo, diliveryPriceMemo])

  // Kiểm tra tồn kho trước khi tạo đơn
  const checkStockBeforeOrder = () => {
    if (!order?.orderItemsSlected) return { ok: true };
    const outOfStock = [];
    order.orderItemsSlected.forEach(item => {
      if (typeof item.countInStock === 'number') {
        if (item.countInStock === 0) outOfStock.push(item);
        if (item.amount > item.countInStock) outOfStock.push(item);
      }
    });
    if (outOfStock.length > 0) {
      setHighlightedProducts(outOfStock.map(i => i.product));
      if (outOfStock.length === 1) {
        setOutOfStockMsg(`Sản phẩm ${outOfStock[0].name} hiện không đủ số lượng trong kho. Vui lòng giảm số lượng hoặc chọn sản phẩm khác.`);
      } else {
        setOutOfStockMsg('Một số sản phẩm trong giỏ hàng đã hết hàng. Vui lòng kiểm tra lại giỏ hàng trước khi đặt hàng.');
      }
      setTimeout(() => {
        setOutOfStockMsg('');
        setHighlightedProducts([]);
      }, 5000);
      return { ok: false };
    }
    return { ok: true };
  };

  const handleAddOrder = async () => {
    setOutOfStockMsg('');
    setHighlightedProducts([]);
    
    const isGuest = user?.id === 'guest';
    const hasUserInfo = user?.name && user?.address && user?.phone && user?.city && user?.id;
    if (!order?.orderItemsSlected || !hasUserInfo || !priceMemo || (!isGuest && !user?.access_token)) {
      return;
    }

    // Kiểm tra tồn kho trước khi gọi API
    const stockCheck = checkStockBeforeOrder();
    if (!stockCheck.ok) return;

    setLoadingOrder(true);
    setProcessingMsg(payment === 'vnpay' ? 'Đang tạo liên kết thanh toán VNPay...' : 'Hệ thống đang xử lý đơn hàng, vui lòng chờ trong giây lát.');

    if (payment === 'vnpay') {
      try {
        const orderData = {
          orderItems: order?.orderItemsSlected,
          fullName: user?.name,
          address: user?.address,
          phone: user?.phone,
          city: user?.city,
          paymentMethod: payment,
          itemsPrice: priceMemo,
          shippingPrice: diliveryPriceMemo,
          totalPrice: totalPriceMemo,
          user: user?.id,
          email: user?.email
        };

        const createRes = isGuest
          ? await OrderService.createGuestOrder(orderData)
          : await OrderService.createOrder(orderData, user?.access_token)

        if (createRes?.status !== 'OK') {
          let msg = createRes?.message || 'Tạo đơn hàng thất bại';
          if (/hết hàng|out of stock|not enough|không đủ/i.test(msg)) {
            msg = 'Rất tiếc, sản phẩm này hiện không đủ hàng để đặt. Vui lòng kiểm tra lại giỏ hàng.';
          }
          setProcessingMsg('');
          setLoadingOrder(false);
          message.error(msg);
          return;
        }

        let latestOrder = createRes?.data;
        if (!latestOrder && !isGuest) {
          const listRes = await OrderService.getOrderByUserId(user?.id, user?.access_token)
          latestOrder = listRes?.data && listRes.data.length ? listRes.data[0] : null
        }

        if (!latestOrder) {
          setProcessingMsg('');
          setLoadingOrder(false);
          message.error('Không tìm được đơn hàng vừa tạo')
          return
        }

        const orderId = latestOrder._id
        try { 
          localStorage.setItem('vnpay_orderId', orderId)
          localStorage.setItem('vnpay_token', user?.access_token || '')
          if (order?.orderItemsSlected) {
            localStorage.setItem('vnpay_ordered_items', JSON.stringify(order.orderItemsSlected.map(item => item.product)))
          }
        } catch (err) {}

        const returnUrl = `${window.location.origin}/payment/vnpay-return`
        const payRes = await PaymentService.createVNPayPayment(orderId, totalPriceMemo, returnUrl, user?.access_token || '')
        if (payRes?.status === 'OK' && payRes?.data?.paymentUrl) {
          // Không cần setLoadingOrder(false) vì sẽ redirect
          setProcessingMsg('');
          window.location.href = payRes.data.paymentUrl
        } else {
          setProcessingMsg('');
          setLoadingOrder(false);
          message.error('Không lấy được đường dẫn thanh toán')
        }
      } catch (e) {
        setProcessingMsg('');
        setLoadingOrder(false);
        let msg = e?.message || 'Lỗi khi tạo thanh toán VNPay';
        if (/hết hàng|out of stock|not enough|không đủ/i.test(msg)) {
          msg = 'Rất tiếc, sản phẩm này hiện không đủ hàng để đặt. Vui lòng kiểm tra lại giỏ hàng.';
        }
        message.error(msg);
      }
      return
    }

    // default flow (COD)
    try {
      await mutationAddOrder.mutateAsync(
        { 
          token: user?.access_token, 
          orderItems: order?.orderItemsSlected, 
          fullName: user?.name,
          address:user?.address, 
          phone:user?.phone,
          city: user?.city,
          paymentMethod: payment,
          itemsPrice: priceMemo,
          shippingPrice: diliveryPriceMemo,
          totalPrice: totalPriceMemo,
          user: user?.id,
          email: user?.email
        }
      )
    } catch (e) {
      let msg = e?.message || 'Tạo đơn hàng thất bại';
      if (/hết hàng|out of stock|not enough|không đủ/i.test(msg)) {
        msg = 'Rất tiếc, sản phẩm này hiện không đủ hàng để đặt. Vui lòng kiểm tra lại giỏ hàng.';
      }
      message.error(msg);
    } finally {
      setProcessingMsg('');
      setLoadingOrder(false);
    }
  }
  
  const mutationUpdate = useMutationHooks(
    (data) => {
      const { id,
        token,
        ...rests } = data
      const res = UserService.updateUser(
        id,
        { ...rests }, token)
      return res
    },
  )

  const mutationAddOrder = useMutationHooks(
    (data) => {
      const {
        token,
        ...rests } = data
      if (rests.user === 'guest') {
        return OrderService.createGuestOrder({ ...rests })
      }
      const res = OrderService.createOrder(
        { ...rests }, token)
      return res
    },
  )

  const {isLoading, data} = mutationUpdate
  const {data: dataAdd,isLoading:isLoadingAddOrder, isSuccess, isError} = mutationAddOrder

  useEffect(() => {
    if (isSuccess && dataAdd?.status === 'OK') {
      const arrayOrdered = []
      order?.orderItemsSlected?.forEach(element => {
        arrayOrdered.push(element.product)
      });
      dispatch(removeAllOrderProduct({listChecked: arrayOrdered}))
      message.success('Đặt hàng thành công')
      setProcessingMsg('');
      setLoadingOrder(false);
      navigate('/orderSuccess', {
        state: {
          delivery,
          payment,
          orders: order?.orderItemsSlected,
          totalPriceMemo: totalPriceMemo
        }
      })
    } else if (isError) {
      setProcessingMsg('');
      setLoadingOrder(false);
      message.error('Đặt hàng thất bại, vui lòng thử lại.')
    }
  }, [isSuccess,isError])

  const handleCancleUpdate = () => {
    setStateUserDetails({
      name: '',
      email: '',
      phone: '',
      isAdmin: false,
    })
    form.resetFields()
    setIsOpenModalUpdateInfo(false)
  }

  const onSuccessPaypal = (details, data) => {
    mutationAddOrder.mutate(
      { 
        token: user?.access_token, 
        orderItems: order?.orderItemsSlected, 
        fullName: user?.name,
        address:user?.address, 
        phone:user?.phone,
        city: user?.city,
        paymentMethod: payment,
        itemsPrice: priceMemo,
        shippingPrice: diliveryPriceMemo,
        totalPrice: totalPriceMemo,
        user: user?.id,
        isPaid :true,
        paidAt: details.update_time, 
        email: user?.email
      }
    )
  }


  const handleUpdateInforUser = () => {
    form.validateFields()
      .then((values) => {
        const { name, address, city, phone, email } = values
        if (user?.id && user?.id !== 'guest') {
          mutationUpdate.mutate({ id: user?.id, token: user?.access_token, name, address, city, phone }, {
            onSuccess: () => {
              dispatch(updateUser({ name, address, city, phone }))
              setIsOpenModalUpdateInfo(false)
            }
          })
        } else {
          dispatch(updateUser({ _id: 'guest', name, address, city, phone, email }))
          setIsOpenModalUpdateInfo(false)
        }
      })
      .catch((errorInfo) => {
        console.log('Validation Failed:', errorInfo)
      })
  }

  const handleOnchangeDetails = (e) => {
    setStateUserDetails({
      ...stateUserDetails,
      [e.target.name]: e.target.value
    })
  }
  const handleDilivery = (e) => {
    setDelivery(e.target.value)
  }

  const handlePayment = (e) => {
    setPayment(e.target.value)
  }



  return (
    <div style={{background: '#f5f5fa', width: '100%', minHeight: '100vh'}}>
      <Loading isLoading={isLoadingAddOrder}>
        <div style={{height: '100%', width: '1270px', margin: '0 auto'}}>
          <h3>Thanh toán</h3>
          <div style={{ display: 'flex', justifyContent: 'center'}}>
            <WrapperLeft>
              <WrapperInfo>
                <div>
                  <Lable>Chọn phương thức giao hàng</Lable>
                  <WrapperRadio onChange={handleDilivery} value={delivery}> 
                    <Radio value="fast">
                      <div style={{display:'flex',flexDirection:'column'}}>
                        <span style={{color: '#ea8500', fontWeight: 'bold'}}>FAST - Giao hàng nhanh</span>
                        <span style={{fontSize:12, color:'#0099cc'}}>Phí: 33.000đ</span>
                      </div>
                    </Radio>
                    <Radio value="ghtk">
                      <div style={{display:'flex',flexDirection:'column'}}>
                        <span style={{color: '#009900', fontWeight: 'bold'}}>GHTK - Giao hàng tiết kiệm</span>
                        <span style={{fontSize:12, color:'#0099cc'}}>Phí: 22.000đ</span>
                      </div>
                    </Radio>
                  </WrapperRadio>
                  <div style={{fontSize:12, color:'#888', marginTop:4, display:'flex',alignItems:'center',gap:4}}>
                    <span style={{fontSize:14}}>ℹ️</span> Shop hỗ trợ ship 22.000đ/đơn bất kỳ. Phí chênh lệch sẽ được cộng theo phương thức giao hàng bạn chọn.
                  </div>
                </div>
              </WrapperInfo>
              <WrapperInfo>
                <div>
                  <Lable>Chọn phương thức thanh toán</Lable>
                  <WrapperRadio onChange={handlePayment} value={payment}> 
                    <Radio value="later_money"> Thanh toán tiền mặt khi nhận hàng</Radio>
                    <Radio value="vnpay"> Thanh toán VNPay</Radio>
                  </WrapperRadio>
                </div>
              </WrapperInfo>
            </WrapperLeft>
            <WrapperRight>
              <div style={{width: '100%'}}>
                <WrapperInfo>
                  <div>
                    <span>Địa chỉ: </span>
                    <span style={{fontWeight: 'bold'}}>{ `${user?.address} ${user?.city}`} </span>
                    <span onClick={handleChangeAddress} style={{color: '#9255FD', cursor:'pointer'}}>Thay đổi</span>
                  </div>
                </WrapperInfo>
                <WrapperInfo>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <span>Tạm tính</span>
                    <span style={{color: '#000', fontSize: '14px', fontWeight: 'bold'}}>{convertPrice(priceMemo)}</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <span>Giảm giá</span>
                    <span style={{color: '#000', fontSize: '14px', fontWeight: 'bold'}}>{convertPrice(priceDiscountMemo)}</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <span>Phí giao hàng</span>
                    <span style={{color: '#000', fontSize: '14px', fontWeight: 'bold'}}>{convertPrice(diliveryPriceMemo)}</span>
                  </div>
                </WrapperInfo>
                <WrapperTotal>
                  <span>Tổng tiền</span>
                  <span style={{display:'flex', flexDirection: 'column'}}>
                    <span style={{color: 'rgb(254, 56, 52)', fontSize: '24px', fontWeight: 'bold'}}>{convertPrice(totalPriceMemo)}</span>
                    <span style={{color: '#000', fontSize: '11px'}}>(Đã bao gồm VAT nếu có)</span>
                  </span>
                </WrapperTotal>
              </div>
              {outOfStockMsg && (
                <div style={{color:'#e67e22', background:'#fffbe6', border:'1px solid #ffe58f', borderRadius:4, padding:'8px 12px', margin:'8px 0', fontSize:14, display:'flex', alignItems:'center', gap:6}}>
                  <span style={{fontSize:18}}>⚠️</span> {outOfStockMsg}
                </div>
              )}
              {processingMsg && (
                <div style={{color:'#888', fontSize:13, margin:'8px 0'}}>{processingMsg}</div>
              )}
              <ButtonComponent
                onClick={handleAddOrder}
                size={40}
                styleButton={{
                  background: loadingOrder ? '#ccc' : 'rgb(255, 57, 69)',
                  height: '48px',
                  width: '320px',
                  border: 'none',
                  borderRadius: '4px',
                  position: 'relative',
                  opacity: loadingOrder ? 0.7 : 1
                }}
                textbutton={loadingOrder ? (payment === 'vnpay' ? 'Đang chuyển đến VNPay...' : 'Đang đặt hàng...') : (payment === 'vnpay' ? 'Thanh toán qua VNPay' : 'Đặt hàng')}
                styleTextButton={{ color: '#fff', fontSize: '15px', fontWeight: '700', display:'flex', alignItems:'center', gap:8 }}
                disabled={loadingOrder}
                loading={loadingOrder}
              />
            </WrapperRight>
          </div>
        </div>
        <ModalComponent title="Cập nhật thông tin giao hàng" open={isOpenModalUpdateInfo} onCancel={handleCancleUpdate} onOk={handleUpdateInforUser}>
          <Loading isLoading={isLoading}>
          <Form
              name="basic"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 20 }}
              autoComplete="on"
              form={form}
            >
              <Form.Item
                label="Name"
                name="name"
                rules={[{ required: true, message: 'Please input your name!' }]}
              >
                <InputComponent value={stateUserDetails['name']} onChange={handleOnchangeDetails} name="name" />
              </Form.Item>
              <Form.Item
                label="City"
                name="city"
                rules={[{ required: true, message: 'Please input your city!' }]}
              >
                <InputComponent value={stateUserDetails['city']} onChange={handleOnchangeDetails} name="city" />
              </Form.Item>
              <Form.Item
                label="Phone"
                name="phone"
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại!' },
                  { pattern: /^[0-9]{10}$/, message: 'Số điện thoại phải chứa đúng 10 chữ số!' }
                ]}
              >
                <InputComponent value={stateUserDetails.phone} onChange={handleOnchangeDetails} name="phone" />
              </Form.Item>

              <Form.Item
                label="Adress"
                name="address"
                rules={[{ required: true, message: 'Please input your  address!' }]}
              >
                <InputComponent value={stateUserDetails.address} onChange={handleOnchangeDetails} name="address" />
              </Form.Item>

              {(!user?.id || user?.id === 'guest') && (
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Vui lòng nhập email để nhận thông báo đơn hàng!' },
                    { type: 'email', message: 'Email không đúng định dạng!' }
                  ]}
                >
                  <InputComponent value={stateUserDetails.email} onChange={handleOnchangeDetails} name="email" />
                </Form.Item>
              )}
            </Form>
          </Loading>
        </ModalComponent>
      </Loading>
    </div>
  )
}

export default PaymentPage