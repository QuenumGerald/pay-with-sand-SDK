import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary'
}

export const Button: React.FC<Props> = ({ variant = 'primary', children, ...props }) => {
  const base = {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #d0d7de',
    cursor: 'pointer',
    fontSize: 14,
  } as React.CSSProperties
  const style: React.CSSProperties =
    variant === 'secondary'
      ? { ...base, background: '#f6f8fa', color: '#24292f' }
      : { ...base, background: '#0969da', color: 'white', borderColor: '#0969da' }
  return (
    <button {...props} style={{ ...(props.style || {}), ...style }}>
      {children}
    </button>
  )
}
