import React from 'react'
import { StyleNameProduct, WrapperCardStyle, WrapperDiscountText, WrapperPriceText, WrapperReportText, WrapperStyleTextSell } from './style'
import { StarFilled } from '@ant-design/icons'
import logo from '../../assets/images/logo.png'
import { useNavigate } from 'react-router-dom'
import { convertPrice } from '../../utils'
import styled from 'styled-components'

const CardComponent = (props) => {
    const { countInStock, description, image, name, price, rating, numReviews, type, discount, selled, id } = props
    const navigate = useNavigate()
    const handleDetailsProduct = (id) => {
        navigate(`/product-details/${id}`)
    }
    return (
        <WrapperCardStyle hoverable onClick={() =>  handleDetailsProduct(id)}>
            <div style={{ width: '100%', height: 180, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img alt="example" src={image} style={{ maxWidth: '100%', maxHeight: '100%' }} />
            </div>
            <img
                src={logo}
                style={{
                    width: '68px',
                    height: '14px',
                    position: 'absolute',
                    top: -1,
                    left: -1,
                    borderTopLeftRadius: '3px'
                }}
            />
            <StyleNameProduct>{name}</StyleNameProduct>
            <WrapperReportText>
                {numReviews > 0 ? (
                    <span style={{ marginRight: '8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>{Number(rating).toFixed(1)} </span>
                        <StarFilled style={{ fontSize: '12px', color: 'rgb(253, 216, 54)' }} />
                        <span style={{ color: '#6b7280' }}>| {numReviews} đánh giá</span>
                    </span>
                ) : (
                    <span style={{ color: '#6b7280', marginRight: '8px' }}>Chưa có đánh giá</span>
                )}
                <WrapperStyleTextSell> | Đã bán {selled ?? 0}</WrapperStyleTextSell>
            </WrapperReportText>
            <WrapperPriceText>
                <span style={{ marginRight: '8px' }}>{convertPrice(price)}</span>
                {discount > 0 && (
                    <WrapperDiscountText>
                        - {discount} %
                    </WrapperDiscountText>
                )}
            </WrapperPriceText>
        </WrapperCardStyle>
    )
}

export default CardComponent