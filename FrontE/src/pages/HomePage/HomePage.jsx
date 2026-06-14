import React from 'react'
import SliderComponent from '../../components/SliderComponent/SliderComponent'
import TypeProduct from '../../components/TypeProduct/TypeProduct'
import { WrapperButtonMore, WrapperProducts, WrapperTypeProduct } from './style'
import slider1 from '../../assets/images/slider1.webp'
import slider2 from '../../assets/images/slider2.webp'
import slider3 from '../../assets/images/slider3.webp'
import CardComponent from '../../components/CardComponent/CardComponent'
import { useQuery } from '@tanstack/react-query'
import * as ProductService from '../../services/ProductService'
import { useSelector } from 'react-redux'
import { useState } from 'react'
import Loading from '../../components/LoadingComponent/Loading'
import { useDebounce } from '../../hooks/useDebounce'
import { useEffect } from 'react'

const HomePage = () => {
  const searchProduct = useSelector((state) => state?.product?.search)
  const searchDebounce = useDebounce(searchProduct, 500)
  const [loading, setLoading] = useState(false)
  const [limit, setLimit] = useState(10)
  const [page, setPage] = useState(0)
  const [typeProducts, setTypeProducts] = useState([])
  
  const fetchProductAll = async (context) => {
    const limit = context?.queryKey && context?.queryKey[1]
    const search = context?.queryKey && context?.queryKey[2]
    const page = context?.queryKey && context?.queryKey[3]
    const res = await ProductService.getAllProduct(search, limit, page)

    return res

  }

  const fetchAllTypeProduct = async () => {
    const res = await ProductService.getAllTypeProduct()
    if(res?.status === 'OK') {
      setTypeProducts(res?.data)
    }
  }

  const { isLoading, data: products, isPreviousData } = useQuery(['products', limit, searchDebounce, page], fetchProductAll, { retry: 3, retryDelay: 1000, keepPreviousData: true })

  useEffect(() => {
    fetchAllTypeProduct()
  }, [])

  return (
    <Loading isLoading={isLoading || loading}>
      <div style={{ width: '1270px', margin: '0 auto' }}>
        <WrapperTypeProduct>
          {typeProducts.map((item) => {
            return (
              <TypeProduct name={item} key={item}/>
            )
          })}
        </WrapperTypeProduct>
      </div>
      <div className='body' style={{ width: '100%', backgroundColor: '#ececec', }}>
        <div id="container" style={{ width: '1270px', margin: '0 auto' , backgroundColor: '#ffffff' }}>
          <SliderComponent arrImages={[slider1, slider2, slider3]} />
          <WrapperProducts>
            {products?.data?.map((product) => {
              return (
                <CardComponent
                  key={product._id}
                  countInStock={product.countInStock}
                  description={product.description}
                  image={product.image}
                  name={product.name}
                  price={product.price}
                  rating={product.rating}
                  numReviews={product.numReviews || 0}
                  type={product.type}
                  selled={product.selled}
                  discount={product.discount}
                  id={product._id}
                />
              )
            })}
          </WrapperProducts>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className="btn-load-more" onClick={() => setPage((p) => Math.max(p - 1, 0))} disabled={page === 0}>Previous</button>
              <div style={{ display: 'flex', gap: 8 }}>
                {Array.from({ length: products?.totalPage || 1 }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPage(idx)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: idx === page ? 'var(--accent-color)' : 'transparent',
                      color: idx === page ? '#fff' : 'inherit',
                      border: '1px solid rgba(15,23,42,0.06)'
                    }}
                  >{idx + 1}</button>
                ))}
              </div>
              <button className="btn-load-more" onClick={() => setPage((p) => Math.min(p + 1, (products?.totalPage || 1) - 1))} disabled={page >= (products?.totalPage || 1) - 1}>Next</button>
            </div>
          </div>
        </div>
      </div>
    </Loading>
  )
}

export default HomePage 