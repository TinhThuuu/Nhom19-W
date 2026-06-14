import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import * as OrderService from '../../services/OrderService'
import Loading from '../../components/LoadingComponent/Loading'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

const formatPrice = (value) => {
  try {
    return new Intl.NumberFormat('vi-VN').format(value) + 'đ'
  } catch (e) {
    return value
  }
}

const Card = ({ title, value }) => (
  <div style={{ background: '#fff', padding: 16, borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', minWidth: 180 }}>
    <div style={{ fontSize: 12, color: '#888' }}>{title}</div>
    <div style={{ fontSize: 20, fontWeight: '700', marginTop: 8 }}>{value}</div>
  </div>
)

const AdminRevenue = () => {
  const user = useSelector(state => state.user)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const res = await OrderService.getRevenueStatistics(user?.access_token)
        if (res?.status === 'OK') {
          setData(res.data)
        } else {
          setError(res?.message || 'Không thể lấy dữ liệu thống kê')
        }
      } catch (e) {
        setError(e?.response?.data?.message || e.message || 'Lỗi khi lấy dữ liệu')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [user])

  if (loading) return <Loading isLoading={true}><div style={{height:300}} /></Loading>

  if (error) return <div style={{padding:20}}><h3>Lỗi</h3><div>{error}</div></div>

  if (!data) return <div style={{padding:20}}>Không có dữ liệu</div>

  const { totalRevenue, totalOrders, paidOrders, todayRevenue, thisMonthRevenue, revenueByMonth, topSellingProducts } = data

  return (
    <div style={{padding: 20}}>
      <h2>Thống kê doanh thu</h2>
      <div style={{display:'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20}}>
        <Card title={'Tổng doanh thu'} value={formatPrice(totalRevenue || 0)} />
        <Card title={'Tổng đơn hàng'} value={totalOrders || 0} />
        <Card title={'Đơn đã thanh toán'} value={paidOrders || 0} />
        <Card title={'Doanh thu hôm nay'} value={formatPrice(todayRevenue || 0)} />
        <Card title={'Doanh thu tháng này'} value={formatPrice(thisMonthRevenue || 0)} />
      </div>

      <div style={{display:'flex', gap: 16, flexWrap: 'wrap'}}>
        <div style={{flex:1, minWidth: 420, background:'#fff', padding:16, borderRadius:8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)'}}>
          <h4>Doanh thu theo tháng</h4>
          {Array.isArray(revenueByMonth) && revenueByMonth.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueByMonth} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatPrice(value)} />
                <Bar dataKey="revenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          ) : (<div>Chưa có dữ liệu doanh thu theo tháng</div>)}
        </div>

        {/* Payment-method breakdown removed per requirements */}
      </div>

      <div style={{marginTop: 20, background:'#fff', padding:16, borderRadius:8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)'}}>
        <h4>Top sản phẩm bán chạy</h4>
        {Array.isArray(topSellingProducts) && topSellingProducts.length ? (
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead>
              <tr style={{textAlign:'left', borderBottom: '1px solid #eee'}}>
                <th style={{padding: '8px 4px'}}>Tên sản phẩm</th>
                <th style={{padding: '8px 4px'}}>Số lượng</th>
                <th style={{padding: '8px 4px'}}>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {topSellingProducts.map((p, idx) => (
                <tr key={idx} style={{borderBottom: '1px solid #f5f5f5'}}>
                  <td style={{padding: '8px 4px'}}>{p.name}</td>
                  <td style={{padding: '8px 4px'}}>{p.quantity}</td>
                  <td style={{padding: '8px 4px'}}>{formatPrice(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div>Chưa có sản phẩm bán chạy</div>
        )}
      </div>
    </div>
  )
}

export default AdminRevenue
