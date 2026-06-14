import styled from "styled-components";
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";

export const WrapperTypeProduct = styled.div`
    display: flex;
    align-items: center;
    gap: 24px;
    justify-content: flex-start;
    height: 44px;
`

export const WrapperButtonMore = styled(ButtonComponent)`
    &:hover {
        color: #fff;
        background: #9255FD;
        span {
            color: #fff;
        }
    }
    width: 100%;
    color: #9255FD;
    text-align: center;
    cursor: ${(props) => props.disabled ? 'not-allowed' : 'pointers'}
`

export const WrapperProducts = styled.div`
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 20px;
    margin-top: 30px;
    align-items: stretch;

    @media (max-width: 1024px) {
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
    }

    @media (max-width: 640px) {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
    }
`