'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Star, Clock, MapPin, Plus, ShoppingCart, Heart, Minus } from 'lucide-react'
import { supabase } from '../../../src/lib/supabaseClient'
import { useCart } from '../../context/CartContext'

interface MenuItem {
  id: string
  restaurant_id: string
  name: string
  description: string
  price: number
  category: string
  image_url?: string
  popular?: boolean
  available?: boolean
  created_at?: string
  updated_at?: string
}

interface Restaurant {
  id: string
  name: string
  cuisine: string
  location: string
  rating: number
  reviews: number
  delivery_time: string
  minimum_order: number
  description: string
  image_url?: string
  created_at?: string
  updated_at?: string
}

interface GroupedMenuItems {
  [category: string]: MenuItem[]
}

export default function RestaurantPage() {
  const params = useParams()
  const router = useRouter()
  const { addItem, removeItem, items } = useCart()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')

  const restaurantId = params?.id as string

  useEffect(() => {
    if (restaurantId) {
      fetchRestaurantData()
    }
  }, [restaurantId])

  const fetchRestaurantData = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Fetch restaurant details
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single()

      if (restaurantError) throw restaurantError
      setRestaurant(restaurantData)

      // Fetch menu items
      const { data: menuData, error: menuError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('category')

      if (menuError) throw menuError
      setMenuItems(menuData || [])
    } catch (err: any) {
      console.error('Error fetching restaurant data:', err)
      setError(err.message || 'An error occurred while loading restaurant details.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (menuItem: MenuItem) => {
    if (!restaurant) return
    addItem({
      id: menuItem.id,
      name: menuItem.name,
      price: menuItem.price, // Price is already in cents from Supabase
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      image: menuItem.image_url || ''
    })
  }

  const handleRemoveFromCart = (menuItemId: string) => {
    removeItem(menuItemId)
  }

  const getItemQuantity = (itemId: string) => {
    const cartItem = items.find(item => item.id === itemId)
    return cartItem ? cartItem.quantity : 0
  }

  // Group menu items by category
  const groupedMenuItems = menuItems.reduce<GroupedMenuItems>((acc, item) => {
    const category = item.category || 'Mains'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(item)
    return acc
  }, {})

  const totalItems = items.reduce((sum, cartItem) => sum + cartItem.quantity, 0)

  interface MenuSectionProps {
    title: string
    itemsList: MenuItem[]
  }

  const MenuSection = ({ title, itemsList }: MenuSectionProps) => (
    <div className="mb-12">
      <h3 className="font-extrabold text-2xl mb-6 text-gray-900 flex items-center gap-3">
        <span className="w-8 h-1 bg-[#FF5A3C] rounded-full inline-block"></span>
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {itemsList.map((item) => {
          const qty = getItemQuantity(item.id)
          return (
            <div 
              key={item.id} 
              className="group relative bg-white rounded-2xl p-5 border border-gray-100 hover:border-[#FF5A3C]/30 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col justify-between"
            >
              {/* Subtle background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FF5A3C]/5 to-transparent rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-150"></div>
              
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col">
                    <h4 className="font-bold text-gray-900 text-lg group-hover:text-[#FF5A3C] transition-colors">{item.name}</h4>
                    {item.popular && (
                      <span className="bg-gradient-to-r from-[#FF5A3C] to-[#FFC857] text-white text-xs font-bold px-3 py-1 rounded-full mt-2 w-fit shadow-sm">
                        🔥 Popular
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-700 font-medium mt-2 line-clamp-2">{item.description}</p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                <div className="font-extrabold text-xl text-gray-900">
                  <span className="text-sm text-gray-700 font-semibold mr-1">KES</span>
                  {(item.price / 100).toFixed(2)}
                </div>
                
                {qty > 0 ? (
                  <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-2 border border-gray-200">
                    <button
                      onClick={() => handleRemoveFromCart(item.id)}
                      className="bg-white hover:bg-red-50 text-gray-700 hover:text-red-500 w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-sm active:scale-95"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="font-bold text-sm px-1 text-gray-900">{qty}</span>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="bg-[#FF5A3C] hover:bg-[#E64A2E] text-white w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-sm active:scale-95"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleAddToCart(item)}
                    className="bg-gray-100 hover:bg-[#FF5A3C] text-gray-900 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-300 active:scale-95 group/btn"
                  >
                    <Plus size={16} className="group-hover/btn:rotate-90 transition-transform" />
                    Add
                  </button>
                )}
              </div>

              {qty > 0 && (
                <div className="absolute top-4 right-4 bg-[#FF5A3C] text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md animate-bounce">
                  {qty}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin w-10 h-10 border-4 border-[#FF5A3C]/20 border-t-[#FF5A3C] rounded-full mb-4"></div>
        <p className="text-gray-700 font-medium">Loading restaurant details...</p>
      </div>
    )
  }

  if (error || !restaurant) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-6">
          {error || 'Restaurant details could not be found.'}
        </div>
        <Link href="/restaurants" className="text-[#FF5A3C] hover:underline font-bold">
          ← Back to Restaurants
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/restaurants" className="inline-flex items-center gap-2 text-gray-700 hover:text-[#FF5A3C] font-semibold transition-colors group w-fit">
        <div className="bg-white p-2 rounded-full shadow-sm group-hover:shadow group-hover:-translate-x-1 transition-all">
          <ArrowLeft size={18} />
        </div>
        Back to Restaurants
      </Link>

      {/* Restaurant Header */}
      <div className="relative bg-white rounded-3xl p-8 md:p-10 border border-gray-100 shadow-sm overflow-hidden">
        {/* Decorative background blur */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#FF5A3C]/10 to-[#FFC857]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <div className="relative flex flex-col md:flex-row justify-between items-start gap-8 z-10">
          <div className="flex-1">
            <div className="inline-block bg-gray-100 text-gray-800 text-xs font-bold px-3 py-1 rounded-full mb-4">
              {restaurant.cuisine}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">{restaurant.name}</h1>
            
            <div className="flex flex-wrap gap-6 text-sm font-semibold text-gray-800 mb-6">
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <Star size={18} className="text-[#FFC857]" fill="#FFC857" />
                <span className="text-gray-900 font-bold">{restaurant.rating}</span>
                <span>({restaurant.reviews} reviews)</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <Clock size={18} className="text-[#FF5A3C]" />
                <span>{restaurant.delivery_time}</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <MapPin size={18} className="text-gray-600" />
                <span>{restaurant.location}</span>
              </div>
            </div>
            
            <p className="text-base text-gray-800 font-medium max-w-2xl leading-relaxed">{restaurant.description}</p>
            <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-gray-900 bg-[#FF5A3C]/5 w-fit px-4 py-2 rounded-xl border border-[#FF5A3C]/10">
              <span className="text-[#FF5A3C]">Info:</span> Minimum order KES {(restaurant.minimum_order / 100).toFixed(2)}
            </div>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <Link 
              href="/cart"
              className="flex-1 md:flex-none bg-gray-900 text-white px-8 py-3.5 rounded-2xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-3 font-semibold"
            >
              <ShoppingCart size={20} />
              View Cart
            </Link>
            <button className="p-3.5 border-2 border-gray-200 rounded-2xl hover:border-red-200 hover:bg-red-50 text-gray-500 hover:text-red-500 transition-all group">
              <Heart size={24} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Menu Sections */}
      <div className="space-y-8">
        {Object.entries(groupedMenuItems).map(([category, itemsList]) => (
          <MenuSection 
            key={category} 
            title={category.charAt(0).toUpperCase() + category.slice(1)} 
            itemsList={itemsList} 
          />
        ))}
      </div>

      {/* Cart Summary - Floating/Sticky */}
      {totalItems > 0 && (
        <div className="fixed md:sticky bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 w-[90%] md:w-auto md:bottom-8 z-50 bg-gray-900/90 backdrop-blur-md rounded-2xl shadow-2xl p-3 border border-gray-700 flex items-center justify-between gap-6 animate-in slide-in-from-bottom-8 duration-500">
          <div className="flex items-center gap-3 pl-4">
            <div className="bg-[#FF5A3C] w-10 h-10 rounded-full flex items-center justify-center relative">
              <ShoppingCart size={20} className="text-white" />
              <span className="absolute -top-1 -right-1 bg-white text-[#FF5A3C] text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                {totalItems}
              </span>
            </div>
            <span className="font-semibold text-white tracking-wide hidden sm:inline">Items in Cart</span>
          </div>
          <Link 
            href="/cart" 
            className="bg-white text-gray-900 px-6 py-3 rounded-xl hover:bg-gray-100 transition-all font-bold shadow-sm"
          >
            Checkout
          </Link>
        </div>
      )}
    </div>
  )
}
