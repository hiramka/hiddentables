'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function CartPage() {
  const router = useRouter()
  const { items, removeItem, updateQuantity, subtotal, deliveryFee, total } = useCart()
  const [loading, setLoading] = useState(false)

  const handleQuantityChange = (id: string, change: number) => {
    const item = items.find(item => item.id === id)
    if (item) {
      updateQuantity(id, item.quantity + change)
    }
  }

  const handleRemoveItem = (id: string) => {
    removeItem(id)
  }

  const handleCheckout = async () => {
    if (items.length === 0) return
    setLoading(true)
    router.push('/checkout')
    setLoading(false)
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingBag size={64} className="mx-auto text-[#5f5b56] mb-4" />
        <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
        <p className="text-[#5f5b56] mb-6">Add some delicious items from our restaurants</p>
        <Link
          href="/restaurants"
          className="inline-block bg-[#d97c4a] text-white px-6 py-3 rounded-full hover:bg-[#c26b3a] transition-colors"
        >
          Browse Restaurants
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/restaurants" className="inline-flex items-center gap-1 text-[#5f5b56] hover:text-[#d97c4a] transition-colors mb-4">
        <ArrowLeft size={16} />
        Continue Shopping
      </Link>

      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl p-4 border border-[#ece7e1]">
              <div className="flex gap-4">
                {/* Image placeholder */}
                <div className="w-20 h-20 bg-[#e7ddd2] rounded-lg flex-shrink-0"></div>

                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-[#6f6b66]">{item.restaurantName}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-[#887c71] hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="flex justify-between items-center mt-3">
                    <div className="flex items-center border border-[#e7e1da] rounded-full">
                      <button
                        onClick={() => handleQuantityChange(item.id, -1)}
                        className="p-1 px-2 hover:bg-[#f0ebe6] rounded-l-full transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-3 text-sm">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, 1)}
                        className="p-1 px-2 hover:bg-[#f0ebe6] rounded-r-full transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="font-semibold">KES {(item.price * item.quantity) / 100}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 border border-[#ece7e1] sticky top-20">
            <h2 className="font-semibold text-lg mb-4">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#5f5b56]">Subtotal</span>
                <span>KES {subtotal / 100}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5f5b56]">Delivery Fee</span>
                <span>KES {deliveryFee / 100}</span>
              </div>
              <div className="border-t border-[#ece7e1] pt-3 mt-3">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>KES {total / 100}</span>
                </div>
                <p className="text-xs text-[#5f5b56] mt-1">Including all taxes</p>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="block w-full bg-[#d97c4a] text-white text-center py-3 rounded-full mt-6 hover:bg-[#c26b3a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Proceed to Checkout'}
            </button>

            <p className="text-xs text-center text-[#5f5b56] mt-4">
              By proceeding, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}