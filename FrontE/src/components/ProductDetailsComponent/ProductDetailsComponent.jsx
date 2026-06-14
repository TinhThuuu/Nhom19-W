import { Col, Image, Rate, Row } from 'antd'
import React from 'react'
import imageProductSmall from '../../assets/images/imagesmall.webp'
import { WrapperStyleImageSmall, WrapperStyleColImage, WrapperStyleNameProduct, WrapperStyleTextSell, WrapperPriceProduct, WrapperPriceTextProduct, WrapperAddressProduct, WrapperQualityProduct, WrapperInputNumber, WrapperBtnQualityProduct } from './style'
import { PlusOutlined, MinusOutlined } from '@ant-design/icons'
import ButtonComponent from '../ButtonComponent/ButtonComponent'
import CardComponent from '../CardComponent/CardComponent'
import * as ProductService from '../../services/ProductService'
import { useQuery } from '@tanstack/react-query'
import Loading from '../LoadingComponent/Loading'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { addOrderProduct,resetOrder } from '../../redux/slides/orderSlide'
import { convertPrice, initFacebookSDK } from '../../utils'
import { useEffect } from 'react'
import * as message from '../Message/Message'
import LikeButtonComponent from '../LikeButtonComponent/LikeButtonComponent'
import CommentComponent from '../CommentComponent/CommentComponent'
import { useMemo } from 'react'
import { postProductReview } from '../../services/ProductService'

const ProductDetailsComponent = ({idProduct}) => {
    const [numProduct, setNumProduct] = useState(1)
    const user = useSelector((state) => state.user)
    const order = useSelector((state) => state.order)
    const [errorLimitOrder,setErrorLimitOrder] = useState(false)
    const [reviewRating, setReviewRating] = useState(5)
    const [reviewComment, setReviewComment] = useState('')
    const [submittingReview, setSubmittingReview] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch()

    const onChange = (value) => { 
        setNumProduct(Number(value))
    }

    const fetchGetDetailsProduct = async (context) => {
        const id = context?.queryKey && context?.queryKey[1]
        if(id) {
            const res = await ProductService.getDetailsProduct(id)
            return res.data
        }
    }

    useEffect(() => {
        initFacebookSDK()
    }, [])

    useEffect(() => {
        const orderRedux = order?.orderItems?.find((item) => item.product === productDetails?._id) 
        if((orderRedux?.amount + numProduct) <= orderRedux?.countInstock || (!orderRedux && productDetails?.countInStock > 0)) {
            setErrorLimitOrder(false)
        } else if(productDetails?.countInStock === 0){
            setErrorLimitOrder(true)
        }
    },[numProduct])

    useEffect(() => {
        if(order.isSucessOrder) {
            message.success('Đã thêm vào giỏ hàng')
        }
        return () => {
            dispatch(resetOrder())
        }
    }, [order.isSucessOrder])

    const handleChangeCount = (type, limited) => {
        if(type === 'increase') {
            if(!limited) {
                setNumProduct(numProduct + 1)
            }
        }else {
            if(!limited) {
                setNumProduct(numProduct - 1)
            }
        }
    }

    const { isLoading, data: productDetails, refetch } = useQuery(['product-details', idProduct], fetchGetDetailsProduct, { enabled : !!idProduct})
    const handleAddOrderProduct = () => {
        const orderRedux = order?.orderItems?.find((item) => item.product === productDetails?._id)
        if((orderRedux?.amount + numProduct) <= orderRedux?.countInstock || (!orderRedux && productDetails?.countInStock > 0)) {
            dispatch(addOrderProduct({
                orderItem: {
                    name: productDetails?.name,
                    amount: numProduct,
                    image: productDetails?.image,
                    price: productDetails?.price,
                    product: productDetails?._id,
                    discount: productDetails?.discount,
                    countInstock: productDetails?.countInStock
                }
            }))
        } else {
            setErrorLimitOrder(true)
        }
    }

    return (
        <Loading isLoading={isLoading}>
            <Row style={{ padding: '16px', background: '#fff', borderRadius: '4px', height:'100%' }}>
                <Col span={10} style={{ borderRight: '1px solid #e5e5e5', paddingRight: '8px' }}>
                    <Image src={productDetails?.image} alt="image prodcut" preview={false} />
                    <Row style={{ paddingTop: '10px', justifyContent: 'space-between' }}>
                        <WrapperStyleColImage span={4} sty>
                            <WrapperStyleImageSmall src={imageProductSmall} alt="image small" preview={false} />
                        </WrapperStyleColImage>
                        <WrapperStyleColImage span={4}>
                            <WrapperStyleImageSmall src={imageProductSmall} alt="image small" preview={false} />
                        </WrapperStyleColImage>

                        <WrapperStyleColImage span={4}>
                            <WrapperStyleImageSmall src={imageProductSmall} alt="image small" preview={false} />
                        </WrapperStyleColImage>

                        <WrapperStyleColImage span={4}>
                            <WrapperStyleImageSmall src={imageProductSmall} alt="image small" preview={false} />
                        </WrapperStyleColImage>

                        <WrapperStyleColImage span={4}>
                            <WrapperStyleImageSmall src={imageProductSmall} alt="image small" preview={false} />
                        </WrapperStyleColImage>

                        <WrapperStyleColImage span={4}>
                            <WrapperStyleImageSmall src={imageProductSmall} alt="image small" preview={false} />
                        </WrapperStyleColImage>

                    </Row>
                </Col>
                <Col span={14} style={{ paddingLeft: '10px' }}>
                    <WrapperStyleNameProduct>{productDetails?.name}</WrapperStyleNameProduct>
                    <div>
                        {productDetails?.numReviews > 0 ? (
                            <>
                                <Rate allowHalf disabled value={productDetails?.rating} />
                                <WrapperStyleTextSell> | Đã bán {productDetails?.selled || 101}</WrapperStyleTextSell>
                            </>
                        ) : (
                            <div style={{ color: '#6b7280' }}>Chưa có đánh giá</div>
                        )}
                    </div>
                    <WrapperPriceProduct>
                        <WrapperPriceTextProduct>{convertPrice(productDetails?.price)}</WrapperPriceTextProduct>
                    </WrapperPriceProduct>
                    {/* address removed to simplify UI */}
                    <LikeButtonComponent
                     dataHref={ process.env.REACT_APP_IS_LOCAL 
                                ? "https://developers.facebook.com/docs/plugins/" 
                                : window.location.href
                            } 
                    />
                    <div style={{ margin: '10px 0 20px', padding: '10px 0', borderTop: '1px solid #e5e5e5', borderBottom: '1px solid #e5e5e5' }}>
                        <div style={{ marginBottom: '10px' }}>Số lượng</div>
                        <WrapperQualityProduct>
                            <button style={{ border: 'none', background: 'transparent', cursor: 'pointer' }} onClick={() => handleChangeCount('decrease',numProduct === 1)}>
                                <MinusOutlined style={{ color: '#000', fontSize: '20px' }} />
                            </button>
                            <WrapperInputNumber onChange={onChange} defaultValue={1} max={productDetails?.countInStock} min={1} value={numProduct} size="small" />
                            <button style={{ border: 'none', background: 'transparent', cursor: 'pointer' }} onClick={() => handleChangeCount('increase',  numProduct === productDetails?.countInStock)}>
                                <PlusOutlined style={{ color: '#000', fontSize: '20px' }} />
                            </button>
                        </WrapperQualityProduct>
                    </div>
                    <div style={{ display: 'flex', aliggItems: 'center', gap: '12px' }}>
                        <div>
                            <ButtonComponent
                                size={40}
                                styleButton={{
                                    background: 'rgb(255, 57, 69)',
                                    height: '48px',
                                    width: '220px',
                                    border: 'none',
                                    borderRadius: '4px'
                                }}
                                onClick={handleAddOrderProduct}
                                textbutton={'Thêm vào giỏ hàng'}
                                styleTextButton={{ color: '#fff', fontSize: '15px', fontWeight: '700' }}
                            ></ButtonComponent>
                            {errorLimitOrder && <div style={{color: 'red'}}>Sản phẩm hết hàng</div>}
                        </div>
                        
                    </div>
                </Col>
            </Row >
            {/* Description section */}
            <div style={{ width: '1270px', margin: '24px auto', background: '#fff', padding: 16, borderRadius: 4, lineHeight: 1.6 }}>
                <h3 style={{ marginBottom: 12 }}>Mô tả sản phẩm</h3>
                <div style={{ color: '#111', whiteSpace: 'pre-wrap' }}>
                    {productDetails?.description && productDetails?.description.trim() !== '' ? (
                        productDetails.description
                    ) : (
                        <span style={{ color: '#6b7280' }}>Chưa có mô tả cho sản phẩm này.</span>
                    )}
                </div>
            </div>

            {/* Reviews section */}
            <div style={{ width: '1270px', margin: '24px auto', background: '#fff', padding: 16, borderRadius: 4 }}>
                <h3 style={{ marginBottom: 12 }}>Đánh giá sản phẩm</h3>

                {productDetails?.numReviews > 0 ? (
                    <div style={{ marginBottom: 12 }}>
                        <Rate allowHalf disabled value={productDetails?.rating} />
                        <span style={{ marginLeft: 8, color: '#6b7280' }}>| {productDetails?.numReviews} đánh giá</span>
                    </div>
                ) : (
                    <div style={{ marginBottom: 12, color: '#6b7280' }}>Chưa có đánh giá</div>
                )}

                {/* Review list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
                    {productDetails?.reviews?.map((r) => (
                        <div key={r._id || `${r.user}-${r.createdAt}`} style={{ border: '1px solid #eee', padding: 12, borderRadius: 6 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <strong>{r.name}</strong>
                                <span style={{ color: '#6b7280' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div style={{ marginBottom: 8 }}>
                                <Rate disabled value={r.rating} />
                            </div>
                            <div style={{ color: '#111' }}>{r.comment}</div>
                        </div>
                    ))}
                </div>

                {/* Review form */}
                <div style={{ borderTop: '1px solid #eee', paddingTop: 12 }}>
                    {!user?.id ? (
                        <div style={{ color: '#6b7280' }}>Vui lòng đăng nhập để đánh giá sản phẩm.</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div>
                                <span style={{ marginRight: 8 }}>Chọn số sao:</span>
                                <Rate value={reviewRating} onChange={(v) => setReviewRating(v)} />
                            </div>
                            <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} rows={4} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e5e5' }} placeholder="Viết bình luận của bạn" />
                            <div>
                                <button disabled={submittingReview} onClick={async () => {
                                    if(!user?.id) {
                                        message.error('Vui lòng đăng nhập để đánh giá sản phẩm.')
                                        return
                                    }
                                    setSubmittingReview(true)
                                    try {
                                        const res = await postProductReview(productDetails?._id, { rating: reviewRating, comment: reviewComment })
                                        if(res?.status === 'OK') {
                                            message.success('Gửi đánh giá thành công')
                                            setReviewComment('')
                                            setReviewRating(5)
                                            await refetch()
                                        } else {
                                            message.error(res?.message || 'Gửi đánh giá thất bại')
                                        }
                                    } catch (err) {
                                        const errMsg = err?.response?.data?.message || err?.message || 'Lỗi khi gửi đánh giá'
                                        message.error(errMsg)
                                    } finally {
                                        setSubmittingReview(false)
                                    }
                                }} style={{ background: 'var(--accent-color)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6 }}>Gửi đánh giá</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ width: '1270px', margin: '24px auto' }}>
                <h3 style={{ marginBottom: 12 }}>Sản phẩm liên quan</h3>
                <RelatedProducts type={productDetails?.type} currentId={productDetails?._id} />
            </div>

            <CommentComponent 
                    dataHref={process.env.REACT_APP_IS_LOCAL 
                        ? "https://developers.facebook.com/docs/plugins/comments#configurator"
                        : window.location.href
                    } 
                    width="1270" 
                />
        </Loading>
    )
}

const RelatedProducts = ({ type, currentId }) => {
    const fetchRelated = async () => {
        if(!type) return { data: [] }
        const res = await ProductService.getProductType(type, 0, 6)
        return res
    }
    const { data } = useQuery(['related', type], fetchRelated, { enabled: !!type })
    const related = data?.data?.filter((p) => p._id !== currentId) || []
    if(!related.length) return <div style={{ color: '#6b7280' }}>Không có sản phẩm liên quan</div>
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
            {related.map((p) => (
                <CardComponent
                    key={p._id}
                    countInStock={p.countInStock}
                    description={p.description}
                    image={p.image}
                    name={p.name}
                    price={p.price}
                    rating={p.rating}
                    numReviews={p.numReviews || 0}
                    type={p.type}
                    selled={p.selled}
                    discount={p.discount}
                    id={p._id}
                />
            ))}
        </div>
    )
}

export default ProductDetailsComponent