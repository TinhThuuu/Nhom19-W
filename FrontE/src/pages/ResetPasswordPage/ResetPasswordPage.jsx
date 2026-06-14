import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import InputForm from '../../components/InputForm/InputForm'
import ButtonComponent from '../../components/ButtonComponent/ButtonComponent'
import Loading from '../../components/LoadingComponent/Loading'
import * as UserService from '../../services/UserService'
import { useMutationHooks } from '../../hooks/useMutationHook'
import * as message from '../../components/Message/Message'
import { WrapperContainerLeft, WrapperContainerRight, WrapperTextLight } from '../SignInPage/style'
import imageLogo from '../../assets/images/logo-login.png'
import { Image } from 'antd'

const ResetPasswordPage = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const mutation = useMutationHooks((data) => UserService.resetPassword(data.token, { password: data.password, confirmPassword: data.confirmPassword }))

  const handleSubmit = async () => {
    if (!password || !confirmPassword) return message.error('Vui lòng điền đầy đủ các trường mật khẩu.')
    if (password.length < 6) return message.error('Mật khẩu mới phải có ít nhất 6 ký tự.')
    if (password !== confirmPassword) return message.error('Mật khẩu mới và xác nhận mật khẩu không khớp.')

    try {
      const res = await mutation.mutateAsync({ token, password, confirmPassword })
      if (res?.status === 'OK') {
        message.success('Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.')
        navigate('/sign-in')
      } else {
        message.error(res?.message || 'Đặt lại mật khẩu thất bại')
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Đặt lại mật khẩu thất bại'
      message.error(msg)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.53)', height: '100vh' }}>
      <div style={{ width: '800px', height: '380px', borderRadius: '6px', background: '#fff', display: 'flex' }}>
        <WrapperContainerLeft>
          <h1>Đặt lại mật khẩu</h1>
          <p>Nhập mật khẩu mới cho tài khoản của bạn.</p>

          <InputForm placeholder="Mật khẩu mới" type="password" value={password} onChange={setPassword} />
          <InputForm placeholder="Nhập lại mật khẩu" type="password" value={confirmPassword} onChange={setConfirmPassword} />

          <Loading isLoading={mutation.isLoading}>
            <ButtonComponent
              disabled={!password || !confirmPassword}
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
              textbutton={'Đặt lại mật khẩu'}
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

export default ResetPasswordPage
