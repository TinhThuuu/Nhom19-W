import { Card } from "antd";
import styled from "styled-components";

export const WrapperCardStyle = styled(Card)`
    width: 100%;
    border-radius: 12px;
    overflow: hidden;
    transition: transform 200ms ease, box-shadow 200ms ease;
    box-shadow: 0 8px 24px rgba(15,23,42,0.06);
    &:hover {
        transform: translateY(-8px);
        box-shadow: 0 18px 48px rgba(15,23,42,0.12);
    }
    & img {
        height: auto;
        width: 100%;
        object-fit: contain;
        display: block;
    }
    position: relative;
    background-color: ${props => props.disabled ? '#f3f4f6' : '#fff'};
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
`

export const StyleNameProduct = styled.div`
    font-weight: 600;
    font-size: 15px;
    line-height: 20px;
    color: #0f172a;
`

export const WrapperReportText = styled.div`
    font-size: 11px;
    color: rgb(128, 128, 137);
    display: flex;
    align-items: center;
    margin: 6px 0 0px;
`

export const WrapperPriceText = styled.div`
    color: var(--accent-color);
    font-size: 16px;
    font-weight: 700;
`

export const WrapperDiscountText = styled.span`
    color: rgb(255, 66, 78);
    font-size: 12px;
    font-weight: 500;
`

export const WrapperStyleTextSell = styled.span`
    font-size: 15px;
    line-height: 24px;
    color: rgb(120, 120, 120)
`