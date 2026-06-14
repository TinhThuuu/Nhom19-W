import React from 'react'
import { Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

const ButttonInputSearch = ({ size, placeholder, onChange, className, style }) => {
  return (
    <div className={`premium-search ${className || ''}`} style={{ width: '100%', ...style }}>
      <Input
        size={size}
        placeholder={placeholder}
        prefix={<SearchOutlined style={{ color: 'var(--muted, #6b7280)' }} />}
        onChange={onChange}
        style={{ borderRadius: 12, background: '#fff', border: '1px solid rgba(15,23,42,0.06)' }}
      />
    </div>
  )
}

export default ButttonInputSearch