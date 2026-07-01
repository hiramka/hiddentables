'use client'

import { useCart } from '../context/CartContext'

export function CartBadge() {
  const { itemCount } = useCart()

  if (itemCount === 0) {
    return null
  }

  return (
    <span className="absolute -top-1 -right-1 bg-[#d97c4a] text-white text-xs rounded-full h-5 min-w-5 flex items-center justify-center px-1.5">
      {itemCount}
    </span>
  )
}
