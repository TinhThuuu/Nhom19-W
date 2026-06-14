import { Button, Form, Space, Select } from 'antd'
import React from 'react'
import { WrapperHeader, WrapperUploadFile } from './style'
import TableComponent from '../TableComponent/TableComponent'
import InputComponent from '../InputComponent/InputComponent'
import DrawerComponent from '../DrawerComponent/DrawerComponent'
import Loading from '../LoadingComponent/Loading'
import ModalComponent from '../ModalComponent/ModalComponent'
import { convertPrice, getBase64 } from '../../utils'
import { useEffect } from 'react'
import * as message from '../Message/Message'
import { useMutationHooks } from '../../hooks/useMutationHook'

import * as OrderService from '../../services/OrderService'
import { useQuery } from '@tanstack/react-query'
import { DeleteOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons'
import { useSelector } from 'react-redux'
import { orderContant } from '../../contant'
import PieChartComponent from './PieChart'

const OrderAdmin = () => {
  const user = useSelector((state) => state?.user)


  const getAllOrder = async () => {
    const res = await OrderService.getAllOrder(user?.access_token)
    return res
  }


  const queryOrder = useQuery({ queryKey: ['orders'], queryFn: getAllOrder })
  const { isLoading: isLoadingOrders, data: orders } = queryOrder

  const mutationUpdateStatus = useMutationHooks(
    (data) => {
      const { id, token, ...rests } = data
      return OrderService.updateOrderStatus(id, rests, token)
    }
  )

  const handleUpdateStatus = (id, fields) => {
    mutationUpdateStatus.mutate({ id, token: user?.access_token, ...fields }, {
      onSuccess: (data) => {
        if (data?.status === 'OK') {
          message.success('Cập nhật trạng thái thành công')
          queryOrder.refetch()
        } else {
          message.error(data?.message || 'Cập nhật trạng thái thất bại')
        }
      },
      onError: () => {
        message.error('Cập nhật trạng thái thất bại')
      }
    })
  }

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
  };
  const handleReset = (clearFilters) => {
    clearFilters();
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <InputComponent
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: 'block',
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? '#1890ff' : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : false,
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        // setTimeout(() => searchInput.current?.select(), 100);
      }
    },
  });

  const columns = [
    {
      title: 'User name',
      dataIndex: 'userName',
      sorter: (a, b) => (a.userName || '').localeCompare(b.userName || ''),
      ...getColumnSearchProps('userName')
    },
    {
      title: 'Product',
      dataIndex: 'product',
      render: (text, record) => {
        return (
          <div>
            {record?.orderItems?.map((item) => (
              <div key={item._id || item.name} style={{ fontSize: '13px', marginBottom: '4px' }}>
                <strong>{item.name}</strong> <span style={{ color: '#8c8c8c' }}>(x{item.amount})</span>
              </div>
            ))}
          </div>
        )
      }
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      sorter: (a, b) => (a.phone || '').localeCompare(b.phone || ''),
      ...getColumnSearchProps('phone')
    },
    {
      title: 'Address',
      dataIndex: 'address',
      sorter: (a, b) => (a.address || '').localeCompare(b.address || ''),
      ...getColumnSearchProps('address')
    },
    {
      title: 'Paided',
      dataIndex: 'isPaid',
      sorter: (a, b) => (a.isPaid || '').localeCompare(b.isPaid || ''),
      ...getColumnSearchProps('isPaid'),
      render: (text, record) => {
        return (
          <Select
            value={record.isPaid}
            style={{ width: 100 }}
            onChange={(value) => handleUpdateStatus(record._id, { isPaid: value === 'TRUE' })}
            options={[
              { value: 'TRUE', label: 'TRUE' },
              { value: 'FALSE', label: 'FALSE' },
            ]}
          />
        )
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      sorter: (a, b) => (a.status || '').localeCompare(b.status || ''),
      ...getColumnSearchProps('status'),
      render: (text, record) => {
        return (
          <Select
            value={record.status}
            style={{ width: 170 }}
            onChange={(value) => handleUpdateStatus(record._id, { status: value })}
            options={[
              { value: 'pending', label: 'Chưa giao hàng' },
              { value: 'delivering', label: 'Đang giao hàng' },
              { value: 'delivered', label: 'Giao hàng thành công' },
              { value: 'cancelled', label: 'Đã hủy' },
            ]}
          />
        )
      }
    },
    {
      title: 'Payment method',
      dataIndex: 'paymentMethod',
      sorter: (a, b) => (a.paymentMethod || '').localeCompare(b.paymentMethod || ''),
      ...getColumnSearchProps('paymentMethod')
    },
    {
      title: 'Total price',
      dataIndex: 'totalPrice',
      sorter: (a, b) => (a.totalPriceRaw || 0) - (b.totalPriceRaw || 0),
      ...getColumnSearchProps('totalPrice')
    },
  ];

  const dataTable = orders?.data?.length && orders?.data?.map((order) => {
    console.log('usewr', order)
    return { 
      ...order, 
      key: order._id, 
      userName: order?.shippingAddress?.fullName, 
      phone: order?.shippingAddress?.phone, 
      address: order?.shippingAddress?.address, 
      paymentMethod: orderContant.payment[order?.paymentMethod],
      isPaid: order?.isPaid ? 'TRUE' :'FALSE',
      isDelivered: order?.isDelivered ? 'TRUE' : 'FALSE', 
      status: order?.status || 'pending',
      totalPrice: convertPrice(order?.totalPrice),
      totalPriceRaw: order?.totalPrice || 0
    }
  })

  return (
    <div>
      <WrapperHeader>Quản lý đơn hàng</WrapperHeader>
      <div style={{height: 200, width:200}}>
        <PieChartComponent data={orders?.data} />
      </div>
      <div style={{ marginTop: '20px' }}>
        <TableComponent  columns={columns} isLoading={isLoadingOrders} data={dataTable} />
      </div>
    </div>
  )
}

export default OrderAdmin