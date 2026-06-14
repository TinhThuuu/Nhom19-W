import { Col, Image, Rate, Row } from 'antd'
import React from 'react'
// thumbnails use product images from productDetails; do not use site logo as placeholder
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

    const { isLoading, data: productDetails, refetch } = useQuery(['product-details', idProduct], fetchGetDetailsProduct, { enabled : !!idProduct})

    const images = productDetails?.images?.length ? productDetails.images : (productDetails?.image ? [productDetails.image] : [])
    const mainImageSrc = productDetails?.image || (images.length ? images[0] : undefined)

    useEffect(() => {
        initFacebookSDK()
    }, [])

    useEffect(() => {
        const orderRedux = order?.orderItems?.find((item) => item.product === productDetails?._id)
        const currentInCart = orderRedux?.amount || 0
        const available = orderRedux?.countInstock ?? productDetails?.countInStock ?? 0
        if ((currentInCart + numProduct) <= available) {
            setErrorLimitOrder(false)
        } else {
            setErrorLimitOrder(true)
        }
    },[numProduct, productDetails, order])

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

    const handleAddOrderProduct = () => {
        const orderRedux = order?.orderItems?.find((item) => item.product === productDetails?._id)
        const currentInCart = orderRedux?.amount || 0
        const available = orderRedux?.countInstock ?? productDetails?.countInStock ?? 0
        if ((currentInCart + numProduct) <= available) {
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
            <div style={{ width: '100%' }}>
                <div style={{ width: '100%' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '45% 55%', gap: 32, background: '#fff', borderRadius: 10, padding: 24, alignItems: 'start' }}>
                        <div style={{ borderRight: '1px solid #f1f5f9', paddingRight: 8 }}>
                            <Image src={mainImageSrc} alt="image product" preview={false} style={{ width: '100%', maxHeight: 340, objectFit: 'contain', display: 'block', margin: '0 auto' }} />
                            {images.length > 1 && (
                                <div style={{ paddingTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                                    {images.map((img, idx) => (
                                        <WrapperStyleImageSmall key={idx} src={img} alt={`thumb-${idx}`} preview={false} />
                                    ))}
                                </div>
                            )}
                        </div>
                        <div style={{ paddingLeft: 8 }}>
                            <WrapperStyleNameProduct>{productDetails?.name}</WrapperStyleNameProduct>
                            {productDetails && (() => {
                                const stock = productDetails?.countInStock ?? 0
                                const inStock = stock > 0
                                const lowStock = inStock && stock <= 5
                                return (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '4px 0', fontSize: 13, lineHeight: '1.4', color: '#6b7280' }}>
                                        <span style={{ color: inStock ? '#16a34a' : '#dc2626', fontWeight: 600 }}>{inStock ? 'Còn hàng' : 'Hết hàng'}</span>
                                        <span style={{ color: '#6b7280' }}>|</span>
                                        <span style={{ color: '#6b7280' }}>{lowStock ? `Chỉ còn ${stock} sản phẩm` : `Tồn kho: ${stock} sản phẩm`}</span>
                                    </div>
                                )
                            })()}
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
                            <LikeButtonComponent
                                dataHref={ process.env.REACT_APP_IS_LOCAL 
                                            ? "https://developers.facebook.com/docs/plugins/" 
                                            : window.location.href
                                        } 
                            />

                            <div style={{ margin: '12px 0 18px', padding: '6px 0' }}>
                                <div style={{ marginBottom: '8px', fontSize: 14, color: '#111' }}>Số lượng</div>
                                <WrapperQualityProduct>
                                    <button style={{ border: 'none', background: 'transparent', cursor: 'pointer' }} onClick={() => handleChangeCount('decrease',numProduct === 1)}>
                                        <MinusOutlined style={{ color: '#000', fontSize: '18px' }} />
                                    </button>
                                    <WrapperInputNumber onChange={onChange} defaultValue={1} max={productDetails?.countInStock} min={1} value={numProduct} size="small" />
                                    <button style={{ border: 'none', background: 'transparent', cursor: 'pointer' }} onClick={() => handleChangeCount('increase',  numProduct === productDetails?.countInStock)}>
                                        <PlusOutlined style={{ color: '#000', fontSize: '18px' }} />
                                    </button>
                                </WrapperQualityProduct>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div>
                                    <ButtonComponent
                                        size={40}
                                        styleButton={{
                                            background: 'rgb(255, 57, 69)',
                                            height: '48px',
                                            width: '240px',
                                            border: 'none',
                                            borderRadius: '6px'
                                        }}
                                        onClick={handleAddOrderProduct}
                                        disabled={(productDetails?.countInStock ?? 0) <= 0}
                                        textbutton={(productDetails?.countInStock ?? 0) <= 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
                                        styleTextButton={{ color: '#fff', fontSize: '15px', fontWeight: 600 }}
                                    ></ButtonComponent>
                                    {errorLimitOrder && <div style={{color: 'red', marginTop: 8}}>Số lượng mua không được vượt quá tồn kho</div>}
                                </div>
                            </div>
                        </div>
                    </div>
            {/* Description section */}
            <div style={{ maxWidth: '1180px', width: '100%', margin: '24px auto', background: '#fff', padding: 16, borderRadius: 8, lineHeight: 1.6 }}>
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
            <div style={{ maxWidth: '1180px', width: '100%', margin: '24px auto', background: '#fff', padding: 16, borderRadius: 8 }}>
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

            <div style={{ maxWidth: '1180px', width: '100%', margin: '24px auto' }}>
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
            </div>
        </div>
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