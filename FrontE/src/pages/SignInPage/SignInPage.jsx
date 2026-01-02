import React, { useEffect, useState } from 'react'
import ButtonComponent from '../../components/ButtonComponent/ButtonComponent'
import InputForm from '../../components/InputForm/InputForm'
import { WrapperContainerLeft, WrapperContainerRight, WrapperTextLight } from './style'
import imageLogo from '../../assets/images/logo-login.png'
import { Image } from 'antd'
import { EyeFilled, EyeInvisibleFilled } from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router-dom'
import * as UserService from '../../services/UserService'
import { useMutationHooks } from '../../hooks/useMutationHook'
import Loading from '../../components/LoadingComponent/Loading'
import jwt_decode from 'jwt-decode'
import { useDispatch } from 'react-redux'
import { updateUser } from '../../redux/slides/userSlide'

const SignInPage = () => {
  const [isShowPassword, setIsShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const mutation = useMutationHooks(data => UserService.loginUser(data))
  const { data, isLoading, isSuccess } = mutation

  useEffect(() => {
    if (isSuccess && data?.access_token) {
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)

      const decoded = jwt_decode(data.access_token)
      if (decoded?.id) {
        handleGetDetailsUser(decoded.id, data.access_token)
      }

      navigate(location?.state || '/')
    }
  }, [isSuccess])

  const handleGetDetailsUser = async (id, token) => {
    const refreshToken = localStorage.getItem('refresh_token') 
    const res = await UserService.getDetailsUser(id, token)

    dispatch(
      updateUser({
        ...res?.data,
        access_token: token,
        refreshToken
      })
    )
  }

  const handleSignIn = () => {
    mutation.mutate({ email, password })
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.53)', height: '100vh' }}>
      <div style={{ width: '800px', height: '445px', borderRadius: '6px', background: '#fff', display: 'flex' }}>
        <WrapperContainerLeft>
          <h1>Xin chào</h1>
          <p>Đăng nhập vào tài khoản</p>

          <InputForm placeholder="exp@gmail.com" value={email} onChange={setEmail} />

          <div style={{ position: 'relative' }}>
            <span
              onClick={() => setIsShowPassword(!isShowPassword)}
              style={{ position: 'absolute', top: '4px', right: '8px', zIndex: 10 }}
            >
              {isShowPassword ? <EyeFilled /> : <EyeInvisibleFilled />}
            </span>

            <InputForm
              placeholder="password"
              type={isShowPassword ? 'text' : 'password'}
              value={password}
              onChange={setPassword}
            />
          </div>

          {data?.status === 'ERR' && <span style={{ color: 'red' }}>{data?.message}</span>}

          <Loading isLoading={isLoading}>
            <ButtonComponent
              disabled={!email || !password}
              onClick={handleSignIn}
              size={40}
              styleButton={{
                background: 'rgb(255, 57, 69)',
                height: '48px',
                width: '100%',
                border: 'none',
                borderRadius: '4px',
                margin: '26px 0 10px'
              }}
              textbutton="Đăng nhập"
              styleTextButton={{ color: '#fff', fontSize: '15px', fontWeight: '700' }}
            />
          </Loading>

          <p><WrapperTextLight>Quên mật khẩu?</WrapperTextLight></p>
          <p>Chưa có tài khoản? <WrapperTextLight onClick={() => navigate('/sign-up')}>Tạo tài khoản</WrapperTextLight></p>
        </WrapperContainerLeft>

        <WrapperContainerRight>
          <Image src={imageLogo} preview={false} height="203px" width="203px" />
          <h4>DT SHOP xin chào!</h4>
        </WrapperContainerRight>
      </div>
    </div>
  )
}

export default SignInPage
