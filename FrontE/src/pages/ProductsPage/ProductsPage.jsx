import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import * as ProductService from '../../services/ProductService'
import Loading from '../../components/LoadingComponent/Loading'
import CardComponent from '../../components/CardComponent/CardComponent'
import { WrapperProducts } from './style'
import { useSelector } from 'react-redux'
import { useDebounce } from '../../hooks/useDebounce'

const ProductsPage = () => {
  const searchProduct = useSelector((state) => state?.product?.search)
  const searchDebounce = useDebounce(searchProduct, 500)
  const [limit, setLimit] = useState(12)
  const [page, setPage] = useState(0)

  const fetchProductAll = async (context) => {
    const limit = context?.queryKey && context?.queryKey[1]
    const search = context?.queryKey && context?.queryKey[2]
    const page = context?.queryKey && context?.queryKey[3]
    const res = await ProductService.getAllProduct(search, limit, page)
    return res
  }

  const { isLoading, data: products, isPreviousData } = useQuery(['products', limit, searchDebounce, page], fetchProductAll, { keepPreviousData: true })

  return (
    <Loading isLoading={isLoading}>
      <div style={{ width: '1270px', margin: '0 auto' }}>
        <h2 style={{ margin: '20px 0' }}>Tất cả sản phẩm</h2>
        <WrapperProducts>
          {products?.data?.map((product) => (
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
          ))}
        </WrapperProducts>
        <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
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
    </Loading>
  )
}

export default ProductsPage