import React, { Fragment, useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import DefaultComponent from './components/DefaultComponent/DefaultComponent'
import { routes } from './routes'
import jwt_decode from 'jwt-decode'
import * as UserService from './services/UserService'
import { useDispatch, useSelector } from 'react-redux'
import { updateUser, resetUser } from './redux/slides/userSlide'
import Loading from './components/LoadingComponent/Loading'

function App() {
    const dispatch = useDispatch()
    const [isLoading, setIsLoading] = useState(false)
    const user = useSelector((state) => state.user)

    const handleDecoded = () => {
        const token = user?.access_token || localStorage.getItem('access_token')
        if (!token) return {}
        const decoded = jwt_decode(token)
        return { decoded, token }
    }

    useEffect(() => {
        const { decoded, token } = handleDecoded()
        if (decoded?.id) {
            getUser(decoded.id, token)
        }
    }, [])

    useEffect(() => {
        const interceptor = UserService.axiosJWT.interceptors.request.use(
            async (config) => {
                const accessToken = localStorage.getItem('access_token')
                const refreshToken = localStorage.getItem('refresh_token')

                if (!accessToken) return config

                const decoded = jwt_decode(accessToken)
                const currentTime = new Date().getTime() / 1000

                if (decoded.exp < currentTime) {
                    try {
                        const data = await UserService.refreshToken(refreshToken)
                        localStorage.setItem('access_token', data.access_token)
                        config.headers.Authorization = `Bearer ${data.access_token}`
                    } catch (err) {
                        dispatch(resetUser())
                        localStorage.clear()
                        return Promise.reject(err)
                    }
                } else {
                    config.headers.Authorization = `Bearer ${accessToken}`
                }

                return config
            }
        )

        return () => {
            UserService.axiosJWT.interceptors.request.eject(interceptor)
        }
    }, [])

    const getUser = async (id, token) => {
        setIsLoading(true)
        const res = await UserService.getDetailsUser(id, token)
        dispatch(updateUser({ ...res.data, access_token: token }))
        setIsLoading(false)
    }

    return (
        <Loading isLoading={isLoading}>
            <Router>
                <Routes>
                    {routes.map((route) => {
                        const Page = route.page
                        const Layout = route.isShowHeader ? DefaultComponent : Fragment
                        return (
                            <Route
                                key={route.path}
                                path={route.path}
                                element={
                                    <Layout>
                                        <Page />
                                    </Layout>
                                }
                            />
                        )
                    })}
                </Routes>
            </Router>
        </Loading>
    )
}
//test commit
export default App
