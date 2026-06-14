import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import ButtonComponent from '../../components/ButtonComponent/ButtonComponent'
import InputForm from '../../components/InputForm/InputForm'
import { WrapperContentProfile, WrapperHeader, WrapperInput, WrapperLabel, WrapperCardTitle, CardTitleMain, CardSubtitle } from './style'
import * as UserService from '../../services/UserService'
import { useMutationHooks } from '../../hooks/useMutationHook'
import Loading from '../../components/LoadingComponent/Loading'
import * as message from '../../components/Message/Message'
import { updateUser } from '../../redux/slides/userSlide'

const ProfilePage = () => {
    const user = useSelector((state) => state.user)
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [address, setAddress] = useState('')
    const [avatar, setAvatar] = useState('')

    // Password change states
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmNewPassword, setConfirmNewPassword] = useState('')
    
    const mutation = useMutationHooks(
        (data) => {
            const { id, access_token, ...rests } = data
            return UserService.updateUser(id, rests, access_token)
        }
    )

    const mutationPass = useMutationHooks(
        (data) => {
            return UserService.changePassword(data)
        }
    )

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { isLoading, isSuccess, isError } = mutation
    const { data: dataPass, isLoading: isLoadingPass, isSuccess: isSuccessPass, isError: isErrorPass } = mutationPass

    useEffect(() => {
        setEmail(user?.email)
        setName(user?.name)
        setPhone(user?.phone)
        setAddress(user?.address)
        setAvatar(user?.avatar)
    }, [user])

    useEffect(() => {
        if (isSuccess) {
            message.success('Cập nhật thông tin thành công!')
            handleGetDetailsUser(user?.id, user?.access_token)
        } else if (isError) {
            message.error()
        }
    }, [isSuccess, isError])

    useEffect(() => {
        if (isSuccessPass) {
            if (dataPass?.status === 'OK') {
                message.success('Đổi mật khẩu thành công!')
                setCurrentPassword('')
                setNewPassword('')
                setConfirmNewPassword('')
            } else {
                message.error(dataPass?.message || 'Đổi mật khẩu thất bại!')
            }
        } else if (isErrorPass) {
            message.error('Đổi mật khẩu thất bại!')
        }
    }, [isSuccessPass, isErrorPass, dataPass])

    const handleGetDetailsUser = async (id, token) => {
        const res = await UserService.getDetailsUser(id, token)
        dispatch(updateUser({ ...res?.data, access_token: token }))
    }

    const handleOnchangeEmail = (value) => {
        setEmail(value)
    }
    const handleOnchangeName = (value) => {
        setName(value)
    }
    const handleOnchangePhone = (value) => {
        setPhone(value)
    }
    const handleOnchangeAddress = (value) => {
        setAddress(value)
    }

    const handleUpdate = () => {
        const phoneReg = /^[0-9]{10}$/
        if (!phone) {
            message.error('Vui lòng nhập số điện thoại!')
            return
        }
        if (!phoneReg.test(phone)) {
            message.error('Số điện thoại phải chứa đúng 10 chữ số!')
            return
        }
        mutation.mutate({ id: user?.id, email, name, phone, address, access_token: user?.access_token })
    }

    const handleUpdatePassword = () => {
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            message.error('Vui lòng nhập đầy đủ các trường mật khẩu.')
            return
        }
        if (newPassword.length < 6) {
            message.error('Mật khẩu mới phải chứa ít nhất 6 ký tự!')
            return
        }
        if (newPassword !== confirmNewPassword) {
            message.error('Mật khẩu mới và xác nhận mật khẩu mới không khớp!')
            return
        }
        mutationPass.mutate({ currentPassword, newPassword, confirmPassword: confirmNewPassword })
    }

    return (
        <div style={{ width: '100%', maxWidth: 1100, margin: '0 auto' }}>

            <Loading isLoading={isLoading || isLoadingPass}>
                <WrapperContentProfile>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 40 }}>
                        {/* Cột 1: Thông tin cá nhân */}
                        <div>
                            <WrapperCardTitle>
                                <CardTitleMain>Thông tin người dùng</CardTitleMain>
                                <CardSubtitle>Cập nhật thông tin cá nhân của bạn</CardSubtitle>
                            </WrapperCardTitle>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <WrapperLabel htmlFor="name" style={{ minWidth: 100 }}>Họ và tên</WrapperLabel>
                                    <InputForm style={{ flex: 1 }} id="name" value={name} onChange={handleOnchangeName} />
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <WrapperLabel htmlFor="email" style={{ minWidth: 100 }}>Email</WrapperLabel>
                                    <InputForm style={{ flex: 1 }} id="email" value={email} onChange={handleOnchangeEmail} />
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <WrapperLabel htmlFor="phone" style={{ minWidth: 100 }}>Số điện thoại</WrapperLabel>
                                    <InputForm style={{ flex: 1 }} id="phone" value={phone} onChange={handleOnchangePhone} />
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <WrapperLabel htmlFor="address" style={{ minWidth: 100 }}>Địa chỉ</WrapperLabel>
                                    <InputForm style={{ flex: 1 }} id="address" value={address} onChange={handleOnchangeAddress} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                                <ButtonComponent
                                    onClick={handleUpdate}
                                    size={48}
                                    styleButton={{
                                        height: '44px',
                                        minWidth: '180px',
                                        borderRadius: '8px',
                                        padding: '0 18px',
                                        background: 'rgb(255, 57, 69)',
                                        border: 'none'
                                    }}
                                    textbutton={'Cập nhật thông tin'}
                                    styleTextButton={{ color: '#fff', fontSize: '15px', fontWeight: '700' }}
                                />
                            </div>
                        </div>

                        {/* Cột 2: Đổi mật khẩu */}
                        <div>
                            <WrapperCardTitle>
                                <CardTitleMain>Đổi mật khẩu</CardTitleMain>
                                <CardSubtitle>Đổi mật khẩu tài khoản của bạn</CardSubtitle>
                            </WrapperCardTitle>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <WrapperLabel htmlFor="currentPassword" style={{ minWidth: 140 }}>Mật khẩu hiện tại</WrapperLabel>
                                    <InputForm style={{ flex: 1 }} id="currentPassword" type="password" placeholder="Nhập mật khẩu hiện tại" value={currentPassword} onChange={setCurrentPassword} />
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <WrapperLabel htmlFor="newPassword" style={{ minWidth: 140 }}>Mật khẩu mới</WrapperLabel>
                                    <InputForm style={{ flex: 1 }} id="newPassword" type="password" placeholder="Tối thiểu 6 ký tự" value={newPassword} onChange={setNewPassword} />
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <WrapperLabel htmlFor="confirmNewPassword" style={{ minWidth: 140 }}>Xác nhận MK mới</WrapperLabel>
                                    <InputForm style={{ flex: 1 }} id="confirmNewPassword" type="password" placeholder="Nhập lại mật khẩu mới" value={confirmNewPassword} onChange={setConfirmNewPassword} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                                <ButtonComponent
                                    onClick={handleUpdatePassword}
                                    size={48}
                                    styleButton={{
                                        height: '44px',
                                        minWidth: '180px',
                                        borderRadius: '8px',
                                        padding: '0 18px',
                                        background: 'rgb(255, 57, 69)',
                                        border: 'none'
                                    }}
                                    textbutton={'Đổi mật khẩu'}
                                    styleTextButton={{ color: '#fff', fontSize: '15px', fontWeight: '700' }}
                                />
                            </div>
                        </div>
                    </div>
                </WrapperContentProfile>
            </Loading>
        </div>
    )
}

export default ProfilePage