import { Upload } from "antd";
import styled from "styled-components";

export const WrapperHeader = styled.h1`
    color: #000;
    font-size: 18px;
    margin: 4px 0;
`
export const WrapperContentProfile = styled.div`
    max-width: 960px;
    margin: 20px auto 0;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 6px 18px rgba(17,24,39,0.06);
    padding: 28px 32px;
`

export const WrapperCardTitle = styled.div`
    display: flex;
    flex-direction: column;
    margin-bottom: 12px;
`

export const CardTitleMain = styled.h2`
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: #0f172a;
`

export const CardSubtitle = styled.div`
    margin-top: 6px;
    color: #6b7280;
    font-size: 13px;
`

export const WrapperLabel = styled.label`
    color: #000;
    font-size: 12px;
    line-height: 30px;
    font-weight: 600;
    white-space: nowrap;
    text-align: left;
`

export const WrapperInput = styled.div`
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
    @media (min-width: 768px) {
      align-items: flex-start;
    }
`

export const WrapperUploadFile = styled(Upload)`
    & .ant-upload.ant-upload-select.ant-upload-select-picture-card {
        width: 60px;
        height: 60px;
        border-radius: 50%;
    }
    & .ant-upload-list-item-info {
        display: none
    }
`