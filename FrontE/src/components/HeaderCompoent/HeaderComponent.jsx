import React, { useEffect, useState } from 'react'
import { Badge, Col, Popover, Drawer } from 'antd'
import {
  UserOutlined,
  CaretDownOutlined,
  ShoppingCartOutlined,
  MenuOutlined,
  CloseOutlined
} from '@ant-design/icons'
import {
  WrapperContentPopup,
  WrapperHeader,
  WrapperHeaderAccout,
  WrapperTextHeaderSmall,
  WrapperHeaderContainer,
  WrapperBrand,
  WrapperLogoText,
  NavMenu
} from './style'
import { WrapperCart } from './style'
import ButttonInputSearch from '../ButtonInputSearch/ButttonInputSearch'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import * as UserService from '../../services/UserService'
import { resetUser } from '../../redux/slides/userSlide'
import Loading from '../LoadingComponent/Loading'
import { searchProduct } from '../../redux/slides/productSlide'

const HeaderComponent = ({ isHiddenSearch = false, isHiddenCart = false }) => {
  const navigate = useNavigate()
  const user = useSelector((state) => state.user)
  const order = useSelector((state) => state.order)
  const dispatch = useDispatch()

  const [userName, setUserName] = useState('')
  const [userAvatar, setUserAvatar] = useState('')
  const [search, setSearch] = useState('')
  const [isOpenPopup, setIsOpenPopup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setUserName(user?.name)
    setUserAvatar(user?.avatar)
  }, [user?.name, user?.avatar])

  const handleNavigateLogin = () => navigate('/sign-in')

  const handleLogout = async () => {
    setLoading(true)
    try {
      await UserService.logoutUser()
    } catch (e) {
      // ignore server errors
    }
    // clear local storage and redux state
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    sessionStorage.clear()
    dispatch(resetUser())
    setLoading(false)
    navigate('/')
  }

  const handleClickNavigate = (type) => {
    if (type === 'profile') navigate('/profile-user')
    else if (type === 'admin') navigate('/system/admin')
    else if (type === 'my-order') navigate('/my-order', { state: { id: user?.id, token: user?.access_token } })
    else handleLogout()
    setIsOpenPopup(false)
  }

  const onSearch = (e) => {
    const v = e?.target?.value ?? ''
    setSearch(v)
    dispatch(searchProduct(v))
  }

  const content = (
    <div>
      <WrapperContentPopup onClick={() => handleClickNavigate('profile')}>Thông tin người dùng</WrapperContentPopup>
      {user?.isAdmin && <WrapperContentPopup onClick={() => handleClickNavigate('admin')}>Quản lí hệ thống</WrapperContentPopup>}
      <WrapperContentPopup onClick={() => handleClickNavigate('my-order')}>Đơn hàng của tôi</WrapperContentPopup>
      <WrapperContentPopup onClick={() => handleClickNavigate()}>Đăng xuất</WrapperContentPopup>
    </div>
  )

  return (
    <WrapperHeaderContainer>
      <WrapperHeader>
        <Col xs={6} sm={6} md={3} lg={3} xl={3}>
          <WrapperBrand to="/">
            <img src={require('../../assets/images/logo1.png')} alt="logo" style={{ height: 48, width: 48, objectFit: 'cover', borderRadius: 8 }} />
            <WrapperLogoText style={{ fontSize: 16 }}>DT Shop</WrapperLogoText>
          </WrapperBrand>
        </Col>

        <Col xs={0} sm={0} md={8} lg={8} xl={8}>
          <NavMenu>
            <a href="/">Trang chủ</a>
            <a href="/products">Sản phẩm</a>
          </NavMenu>
        </Col>

        {!isHiddenSearch && (
          <Col xs={12} sm={12} md={6} lg={6} xl={6}>
            <div style={{ maxWidth: 320, flexShrink: 1, minWidth: 0 }}>
              <ButttonInputSearch size="large" placeholder="Tìm kiếm sản phẩm, thương hiệu..." onChange={onSearch} />
            </div>
          </Col>
        )}

        <Col xs={6} sm={6} md={6} lg={6} xl={6} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Loading isLoading={loading}>
            <WrapperHeaderAccout>
              {userAvatar ? (
                <img src={userAvatar} alt="avatar" style={{ height: 28, width: 28, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <UserOutlined style={{ fontSize: 22, color: '#0f172a' }} />
              )}

              {user?.email ? (
                <Popover content={content} trigger="click">
                  <div style={{ cursor: 'pointer', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName?.length ? userName : user?.email}</div>
                </Popover>
              ) : (
                <div onClick={handleNavigateLogin} style={{ cursor: 'pointer' }}>
                  <WrapperTextHeaderSmall style={{ fontSize: 14 }}>Đăng nhập/Đăng ký</WrapperTextHeaderSmall>
                </div>
              )}
            </WrapperHeaderAccout>
          </Loading>

          {!isHiddenCart && (
            <WrapperCart onClick={() => navigate('/order')}>
              <Badge count={order?.orderItems?.length} size="small">
                <ShoppingCartOutlined style={{ fontSize: 22, color: '#0f172a' }} />
              </Badge>
              <span className="cart-text" style={{ fontSize: 14 }}>Giỏ hàng</span>
            </WrapperCart>
          )}
        </Col>

        <div className="mobile-menu-button" style={{ display: 'none', marginLeft: 12 }} onClick={() => setMobileOpen(true)}>
          <MenuOutlined style={{ fontSize: 22 }} />
        </div>
      </WrapperHeader>

      <Drawer title={false} placement="left" onClose={() => setMobileOpen(false)} open={mobileOpen} bodyStyle={{ padding: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <a href="/">Trang chủ</a>
          <a href="/products">Sản phẩm</a>
        </div>
      </Drawer>
    </WrapperHeaderContainer>
  )
}

export default HeaderComponent
