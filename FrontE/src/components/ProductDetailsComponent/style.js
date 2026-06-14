import { Col, Image, InputNumber } from "antd";
import styled from "styled-components";

export const WrapperStyleImageSmall = styled(Image)`
    height: 56px;
    width: 56px;
    border-radius: 8px;
    cursor: pointer;
    background: #fff;
    border: 1px solid #e5e7eb;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    img {
        width: 100% !important;
        height: 100% !important;
        object-fit: contain !important;
        display: block !important;
    }
`

export const WrapperStyleColImage = styled(Col)`
    flex-basis: unset;
    display: flex;
`

export const WrapperStyleNameProduct = styled.h1`
    color: #0f172a;
    font-size: 24px;
    font-weight: 700;
    line-height: 32px;
    margin: 0 0 8px 0;
`

export const WrapperStyleTextSell = styled.span`
    font-size: 15px;
    line-height: 24px;
    color: rgb(120, 120, 120)
`

export const WrapperPriceProduct = styled.div`
    background: transparent;
    border-radius: 6px;
`

export const WrapperPriceTextProduct = styled.h1`
    font-size: 32px;
    line-height: 40px;
    margin-right: 8px;
    font-weight: 700;
    padding: 6px 0;
    margin-top: 8px;
`

export const WrapperAddressProduct = styled.div`
    span.address {
        text-decoration: underline;
        font-size: 15px;
        line-height: 24px;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsisl
    };
    span.change-address {
        color: rgb(11, 116, 229);
        font-size: 16px;
        line-height: 24px;
        font-weight: 500;
    }
`

export const WrapperQualityProduct = styled.div`
    display: flex;
    gap: 8px;
    align-items: center;
        width: 160px;
    border: 1px solid rgba(15,23,42,0.06);
    border-radius: 8px;
    padding: 6px 8px;
`

export const WrapperMain = styled.div`
    display: grid;
    grid-template-columns: 45% 55%;
    gap: 32px;
    background: #fff;
    border-radius: 10px;
    padding: 24px;
    align-items: start;
    width: 100%;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        padding: 16px;
    }
`

export const WrapperInputNumber = styled(InputNumber)`
    &.ant-input-number.ant-input-number-sm {
        width: 40px;
        border-top: none;
        border-bottom: none;
        .ant-input-number-handler-wrap {
            display: none !important;
        }
    };
    input {
        text-align: center;
        border: none;
        outline: none;
    }
`