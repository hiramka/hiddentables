'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Star, Clock, MapPin, Plus, ShoppingCart, Heart } from 'lucide-react'
import { useCart } from './context/CartContext'

// Define types
interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  popular?: boolean
}

interface Restaurant {
  id: string | string[]
  name: string
  cuisine: string
  location: string
  rating: number
  reviews: number
  deliveryTime: string
  minimumOrder: string
  description: string
  menu: {
    popular: MenuItem[]
    mains: MenuItem[]
    sides: MenuItem[]
    drinks: MenuItem[]
    [key: string]: MenuItem[] // Index signature for dynamic access
  }
}

export default function RestaurantPage() {
  const { addItem, items } = useCart()

  // Mock data - in production, fetch from Supabase or API
  const restaurant: Restaurant = {
    id: 'root-restaurant',
    name: "Mama Jane's Kitchen",
    cuisine: "Traditional Swahili",
    location: "Kilimani, Nairobi",
    rating: 4.8,
    reviews: 234,
    deliveryTime: "25-35 min",
    minimumOrder: "KES 500",
    description: "Authentic Swahili cuisine passed down through generations. Known for our secret family recipes.",
    menu: {
      popular: [
        { id: 'nyama-choma', name: 'Nyama Choma Platter', description: 'Grilled meat with kachumbari', price: 1200, popular: true },
        { id: 'samosa', name: 'Samosa (2 pcs)', description: 'Beef or vegetable', price: 150, popular: true },
        { id: 'kuku-kaka', name: 'Kuku Paka', description: 'Chicken in rich coconut curry', price: 950, popular: true },
        { id: 'mutura', name: 'Mutura Special', description: 'Traditional African sausage', price: 200, popular: true },
        { id: 'matoke', name: 'Matoke Curry', description: 'Plantains in thick peanut sauce', price: 550, popular: true }
      ],
      mains: [
        { id: 'pilau', name: 'Pilau', description: 'Spiced rice with meat', price: 450 },
        { id: 'biryani', name: 'Chicken Biryani', description: 'Aromatic rice dish', price: 650 },
        { id: 'ugali-fish', name: 'Ugali & Fish', description: 'Grilled tilapia with ugali', price: 850 },
        { id: 'githeri', name: 'Githeri', description: 'Boiled maize and beans stew', price: 350 },
        { id: 'mukimo', name: 'Mukimo', description: 'Mashed potatoes with pumpkin leaves and corn', price: 400 }
      ],
      sides: [
        { id: 'kachumbari', name: 'Kachumbari', description: 'Fresh tomato and onion salad', price: 120 },
        { id: 'chapati', name: 'Chapati', description: 'Soft flatbread', price: 80 },
        { id: 'sukuma-wiki', name: 'Sukuma Wiki', description: 'Braised collard greens', price: 100 },
        { id: 'chips', name: 'Masala Chips', description: 'Fries tossed in spicy sauce', price: 250 }
      ],
      drinks: [
        { id: 'chai', name: 'Chai Masala', description: 'Spiced tea', price: 80 },
        { id: 'juice', name: 'Fresh Juice', description: 'Seasonal fruit (Mango, Passion)', price: 150 },
        { id: 'soda', name: 'Soda', description: 'Assorted soft drinks', price: 100 },
        { id: 'dawa', name: 'Dawa', description: 'Hot honey, lemon and ginger tea', price: 200 }
      ]
    }
  }

  const addToCart = (item: MenuItem) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price * 100, // Convert to cents
      restaurantId: restaurant.id as string,
      restaurantName: restaurant.name,
      image: ''
    })
  }

  const getItemQuantity = (id: string) => {
    const item = items.find(i => i.id === id)
    return item ? item.quantity : 0
  }

  // Define props interface for MenuSection
  interface MenuSectionProps {
    title: string
    items: MenuItem[]
  }

  const MenuSection = ({ title, items }: MenuSectionProps) => (
    <div className="mb-12">
      <h3 className="font-extrabold text-2xl mb-6 text-gray-900 flex items-center gap-3">
        <span className="w-8 h-1 bg-[#FF5A3C] rounded-full inline-block"></span>
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item: MenuItem) => (
          <div key={item.id} className="group relative bg-white rounded-2xl p-5 border border-gray-100 hover:border-[#FF5A3C]/30 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col justify-between">
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
                {item.price}
              </div>
              <button 
                onClick={() => addToCart(item)}
                className="bg-gray-100 hover:bg-[#FF5A3C] text-gray-900 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-300 active:scale-95 group/btn"
              >
                <Plus size={16} className="group-hover/btn:rotate-90 transition-transform" />
                Add
              </button>
            </div>
            {getItemQuantity(item.id) > 0 && (
              <div className="absolute top-4 right-4 bg-[#FF5A3C] text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md animate-bounce">
                {getItemQuantity(item.id)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  // Calculate total items in cart
  const totalItems = items.reduce((sum, cartItem) => sum + cartItem.quantity, 0)

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
                <span>{restaurant.deliveryTime}</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <MapPin size={18} className="text-gray-600" />
                <span>{restaurant.location}</span>
              </div>
            </div>
            
            <p className="text-base text-gray-800 font-medium max-w-2xl leading-relaxed">{restaurant.description}</p>
            <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-gray-900 bg-[#FF5A3C]/5 w-fit px-4 py-2 rounded-xl border border-[#FF5A3C]/10">
              <span className="text-[#FF5A3C]">Info:</span> Minimum order {restaurant.minimumOrder}
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
        {Object.entries(restaurant.menu).map(([key, items]) => (
          <MenuSection 
            key={key} 
            title={key.charAt(0).toUpperCase() + key.slice(1)} 
            items={items} 
          />
        ))}
      </div>

      {/* Cart Summary - Fixed on mobile, floating on desktop */}
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