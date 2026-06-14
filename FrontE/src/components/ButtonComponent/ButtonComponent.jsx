import { Button } from 'antd'
import React from 'react'

const ButtonComponent = ({ size, styleButton, styleTextButton, textbutton, disabled, ...rests }) => {
  const safeStyle = styleButton || {}
  return (
    <Button
      style={{
        ...safeStyle,
        background: disabled ? '#ccc' : safeStyle.background
      }}
      disabled={disabled}
      size={size}
      {...rests}
    >
      <span style={styleTextButton}>{textbutton}</span>
    </Button>
  )
}

export default ButtonComponent