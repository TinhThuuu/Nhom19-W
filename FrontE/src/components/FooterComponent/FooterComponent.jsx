import React from 'react'
import { Link } from 'react-router-dom'
import { Row, Col } from 'antd'
import * as ProductService from '../../services/ProductService'
import { useQuery } from '@tanstack/react-query'
import './style.css'

const FooterComponent = () => {
  const fetchFeatured = async () => {
    const res = await ProductService.getAllProduct('', 4)
    return res
  }

  const { data } = useQuery(['footer-featured'], fetchFeatured, { staleTime: 1000 * 60 * 5 })

  return (
    <footer className="site-footer">
      <div className="container">
        <Row gutter={[24,24]}>
          <Col xs={24} sm={12} md={8}>
            <div className="footer-brand">
              <img src={require('../../assets/images/logo.png')} alt="logo" style={{height:40}} />
              <p>DT Shop - Cửa hàng điện thoại thông minh.</p>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <h4>Liên hệ</h4>
            <p>Địa chỉ: 97 Man Thiện</p>
            <p>Điện thoại: 0976580867</p>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <h4>Sản phẩm nổi bật</h4>
            <ul className="footer-product-list">
              {data?.data?.map((p) => (
                <li key={p._id}>
                  <Link to={`/product-details/${p._id}`}>{p.name}</Link>
                </li>
              ))}
            </ul>
          </Col>
        </Row>
        <div className="footer-bottom">© {new Date().getFullYear()} DT Shop. All rights reserved.</div>
      </div>
    </footer>
  )
}

export default FooterComponent
