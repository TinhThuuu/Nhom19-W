import React, { useState } from 'react'
import InputForm from '../../components/InputForm/InputForm'
import ButtonComponent from '../../components/ButtonComponent/ButtonComponent'
import Loading from '../../components/LoadingComponent/Loading'
import * as UserService from '../../services/UserService'
import { useMutationHooks } from '../../hooks/useMutationHook'
import * as message from '../../components/Message/Message'
import { useNavigate } from 'react-router-dom'
import { WrapperContainerLeft, WrapperContainerRight, WrapperTextLight } from '../SignInPage/style'
import imageLogo from '../../assets/images/logo-login.png'
import { Image } from 'antd'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const navigate = useNavigate()

  const mutation = useMutationHooks((data) => UserService.forgotPassword(data))

  const handleSubmit = async () => {
    if (!email) return message.error('Vui lòng nhập email')
    try {
      const res = await mutation.mutateAsync({ email })
      message.success(res?.message || 'Nếu email tồn tại, hệ thống sẽ gửi hướng dẫn đặt lại mật khẩu.')
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Gửi yêu cầu thất bại'
      message.error(msg)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.53)', height: '100vh' }}>
      <div style={{ width: '800px', height: '360px', borderRadius: '6px', background: '#fff', display: 'flex' }}>
        <WrapperContainerLeft>
          <h1>Quên mật khẩu</h1>
          <p>Nhập email tài khoản của bạn để nhận liên kết đặt lại mật khẩu.</p>

          <InputForm placeholder="email-ví dụ: dtshop@gmail.com" value={email} onChange={setEmail} />

          <Loading isLoading={mutation.isLoading}>
            <ButtonComponent
              disabled={!email}
              onClick={handleSubmit}
              size={40}
              styleButton={{
                background: 'rgb(255, 57, 69)',
                height: '48px',
                width: '100%',
                border: 'none',
                borderRadius: '4px',
                margin: '18px 0 10px'
              }}
              textbutton={'Gửi yêu cầu'}
              styleTextButton={{ color: '#fff', fontSize: '15px', fontWeight: '700' }}
            />
          </Loading>

          <p><WrapperTextLight onClick={() => navigate('/sign-in')}>Quay lại đăng nhập</WrapperTextLight></p>
        </WrapperContainerLeft>

        <WrapperContainerRight>
          <Image src={imageLogo} preview={false} height="203px" width="203px" />
          <h4>DT SHOP xin chào!</h4>
        </WrapperContainerRight>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
