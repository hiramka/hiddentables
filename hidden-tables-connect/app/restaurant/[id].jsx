'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Star, Clock, MapPin, Plus, ShoppingCart, Heart } from 'lucide-react'
import { supabase } from '../../src/lib/supabaseClient'
import { useCart } from '../context/CartContext'

export default function RestaurantPage() {
  const params = useParams()
  const { addItem, items } = useCart()
  const [restaurant, setRestaurant] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchRestaurantData()
    }
  }, [params.id])

  const fetchRestaurantData = async () => {
    try {
      // Fetch restaurant details
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', params.id)
        .single()

      if (restaurantError) throw restaurantError
      setRestaurant(restaurantData)

      // Fetch menu items
      const { data: menuData, error: menuError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', params.id)
        .order('category')

      if (menuError) throw menuError
      setMenuItems(menuData || [])
    } catch (error) {
      console.error('Error fetching restaurant data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (menuItem) => {
    addItem({
      id: menuItem.id,
      name: menuItem.name,
      price: menuItem.price, // Price is already in cents from Supabase
      restaurantId: restaurant?.id,
      restaurantName: restaurant?.name,
      image: menuItem.image_url
    })
  }

  const getItemQuantity = (itemId: string) => {
    const cartItem = items.find(item => item.id === itemId)
    return cartItem ? cartItem.quantity : 0
  }

  // Group menu items by category
  const groupedMenuItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {})

  const cartItems = items || []

  const MenuSection = ({ title, items }) => (
    <div className="mb-8">
      <h3 className="font-semibold text-lg mb-3">{title}</h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-lg p-4 border border-[#ece7e1] hover:border-[#dbbca7] transition-all">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{item.name}</h4>
                  {item.popular && (
                    <span className="bg-[#e7ddd2] text-[#1a1a1a] text-xs px-2 py-0.5 rounded-full">🔥 Popular</span>
                  )}
                </div>
                <p className="text-sm text-[#6f6b66] mt-1">{item.description}</p>
              </div>
              <div className="text-right ml-4">
                <div className="font-semibold text-[#d97c4a]">KES {(item.price / 100).toFixed(2)}</div>
                <button
                  onClick={() => handleAddToCart(item)}
                  className="mt-2 bg-[#d97c4a] text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-1 hover:bg-[#c26b3a] transition-colors"
                >
                  <Plus size={14} />
                  Add
                </button>
              </div>
            </div>
            {getItemQuantity(item.id) > 0 && (
              <div className="mt-2 text-sm text-[#5f5b56]">
                In cart: {getItemQuantity(item.id)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-[#1a1a1a]">Loading restaurant...</p>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="text-center py-12">
        <p className="text-[#1a1a1a]">Restaurant not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/restaurants" className="inline-flex items-center gap-1 text-[#5f5b56] hover:text-[#d97c4a] transition-colors">
        <ArrowLeft size={16} />
        Back to Restaurants
      </Link>

      {/* Restaurant Header */}
      <div className="bg-white rounded-xl p-6 border border-[#ece7e1]">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-[#111111]">
              {restaurant.name}
            </h1>
            <p className="text-[#1a1a1a] mb-3 font-medium">{restaurant.cuisine}</p>
            
            <div className="flex flex-wrap gap-4 text-sm text-[#1a1a1a]">
              <div className="flex items-center gap-1">
                <Star size={16} className="text-[#d97c4a]" fill="#d97c4a" />
                <span>{restaurant.rating} ({restaurant.reviews} reviews)</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={16} className="text-[#1a1a1a]" />
                <span className="text-[#1a1a1a]">{restaurant.delivery_time}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin size={16} className="text-[#1a1a1a]" />
                <span className="text-[#1a1a1a]">{restaurant.location}</span>
              </div>
            </div>
            
            <p className="mt-4 text-sm text-[#6f6b66] max-w-2xl">{restaurant.description}</p>
            <p className="mt-2 text-sm font-semibold text-[#1a1a1a]">
              Minimum order: KES {(restaurant.minimum_order / 100).toFixed(2)}
            </p>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <button className="flex-1 md:flex-none bg-[#d97c4a] text-white px-6 py-2 rounded-full hover:bg-[#c26b3a] transition-colors flex items-center justify-center gap-2">
              <ShoppingCart size={18} />
              View Cart
            </button>
            <button className="p-2 border border-[#e7e1da] rounded-full hover:bg-[#f0ebe6] transition-colors">
              <Heart size={20} className="text-[#5f5b56]" />
            </button>
          </div>
        </div>
      </div>

      {/* Menu Sections */}
      <div className="space-y-8">
        {Object.entries(groupedMenuItems).map(([category, items]) => (
          <MenuSection 
            key={category} 
            title={category.charAt(0).toUpperCase() + category.slice(1)} 
            items={items} 
          />
        ))}
      </div>

      {/* Cart Summary - Fixed on mobile, floating on desktop */}
      {Object.keys(cartItems).length > 0 && (
        <div className="sticky bottom-4 md:bottom-6 bg-white rounded-full shadow-lg p-2 border border-[#ece7e1] flex items-center justify-between">
          <div className="flex items-center gap-2 ml-2">
            <ShoppingCart size={18} className="text-[#d97c4a]" />
            <span className="font-medium">{Object.values(cartItems).reduce((a, b) => a + b, 0)} items</span>
          </div>
          <Link 
            href="/cart" 
            className="bg-[#d97c4a] text-white px-6 py-2 rounded-full hover:bg-[#c26b3a] transition-colors"
          >
            View Cart
          </Link>
        </div>
      )}
    </div>
  )
}