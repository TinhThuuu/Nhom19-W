import { Row } from "antd";
import { Link } from "react-router-dom";
import styled from "styled-components";

export const WrapperHeaderContainer = styled.header`
    position: sticky;
    top: 0;
    z-index: 1200;
    width: 100%;
    background: #ffffff;
    border-bottom: 1px solid rgba(15,23,42,0.06);
    box-shadow: 0 6px 18px rgba(17,24,39,0.04);
`;

export const WrapperHeader = styled(Row)`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: nowrap;
    max-width: 1200px;
    margin: 0 auto;
    padding: 14px 24px;
    min-height: 72px;
    width: 100%;
    box-sizing: border-box;
    & > * { min-width: 0; }
`;

export const WrapperBrand = styled(Link)`
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
`;

export const WrapperLogoText = styled.span`
    font-size: 18px;
    color: #0f172a;
    font-weight: 700;
`;

export const NavMenu = styled.nav`
    display: flex;
    gap: 14px;
    align-items: center;
    a {
        color: #0f172a;
        text-decoration: none;
        font-size: 15px;
        padding: 6px 8px;
        border-radius: 6px;
        transition: background 160ms ease, transform 140ms ease, color 140ms ease;
        font-weight: 600;
    }
    a:hover { background: rgba(15,23,42,0.04); }
`;

export const WrapperHeaderAccout = styled.div`
    display: flex;
    align-items: center;
    color: #0f172a;
    gap: 8px;
    max-width: 260px;
    min-width: 120px;
    justify-content: flex-end;
`;

export const WrapperTextHeaderSmall = styled.span`
    font-size: 14px;
    color: #0f172a;
    white-space: nowrap;
`;

export const WrapperContentPopup = styled.p`
    cursor: pointer;
    margin: 0;
    padding: 8px 12px;
    border-radius: 6px;
    &:hover { color: var(--primary-color, #0ea5e9); background: rgba(0,0,0,0.02); }
`;

export const WrapperCart = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    margin-left: 8px;
    padding: 6px 8px;
    border-radius: 8px;
    transition: background 160ms ease, transform 160ms ease;
    &:hover { background: rgba(15,23,42,0.04); transform: translateY(-2px); }
    .cart-text { font-size: 14px; color: #0f172a; white-space: nowrap; }
`;

