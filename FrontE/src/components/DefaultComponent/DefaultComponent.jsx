import React from 'react'
import HeaderComponent from '../HeaderCompoent/HeaderComponent'
import FooterComponent from '../FooterComponent/FooterComponent'

const DefaultComponent = ({children}) => {
  return (
    <div className="app-root" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <HeaderComponent />
        <main style={{ flex: 1 }}>{children}</main>
        <FooterComponent />
    </div>
  )
}

export default DefaultComponent