'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Star, TrendingUp, Flame } from 'lucide-react'

export default function PopularPage() {
  const [timeframe, setTimeframe] = useState('week')

  const popularDishes = {
    week: [
      { id: 'nyama-choma', name: 'Nyama Choma Platter', restaurant: "Mama Jane's Kitchen", orders: 342, trend: '+15%', image: '🍖' },
      { id: 'samosa', name: 'Samosa', restaurant: "Street Delights", orders: 289, trend: '+8%', image: '🥟' },
      { id: 'pilau', name: 'Pilau', restaurant: "Swahili Deli", orders: 256, trend: '+12%', image: '🍚' },
      { id: 'chai', name: 'Chai Masala', restaurant: "Spice Route", orders: 423, trend: '+22%', image: '🫖' },
      { id: 'cappuccino', name: 'Cappuccino', restaurant: "Kafe Central", orders: 198, trend: '+5%', image: '☕' },
    ],
    month: [
      { id: 'chai', name: 'Chai Masala', restaurant: "Spice Route", orders: 1450, trend: '+18%', image: '🫖' },
      { id: 'nyama-choma', name: 'Nyama Choma Platter', restaurant: "Mama Jane's Kitchen", orders: 1120, trend: '+12%', image: '🍖' },
      { id: 'samosa', name: 'Samosa', restaurant: "Street Delights", orders: 890, trend: '+10%', image: '🥟' },
    ],
    year: [
      { id: 'chai', name: 'Chai Masala', restaurant: "Spice Route", orders: 12500, trend: '+25%', image: '🫖' },
      { id: 'nyama-choma', name: 'Nyama Choma Platter', restaurant: "Mama Jane's Kitchen", orders: 9800, trend: '+20%', image: '🍖' },
    ]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <Flame size={48} className="mx-auto text-[#d97c4a] mb-4" />
        <h1 className="text-2xl font-bold mb-2">Popular Dishes</h1>
        <p className="text-[#5f5b56]">Trending items loved by our community</p>
      </div>

      {/* Timeframe Selector */}
      <div className="flex justify-center gap-2">
        <button
          onClick={() => setTimeframe('week')}
          className={`px-6 py-2 rounded-full transition-colors ${
            timeframe === 'week'
              ? 'bg-[#d97c4a] text-white'
              : 'bg-white border border-[#e7e1da] hover:bg-[#f0ebe6]'
          }`}
        >
          This Week
        </button>
        <button
          onClick={() => setTimeframe('month')}
          className={`px-6 py-2 rounded-full transition-colors ${
            timeframe === 'month'
              ? 'bg-[#d97c4a] text-white'
              : 'bg-white border border-[#e7e1da] hover:bg-[#f0ebe6]'
          }`}
        >
          This Month
        </button>
        <button
          onClick={() => setTimeframe('year')}
          className={`px-6 py-2 rounded-full transition-colors ${
            timeframe === 'year'
              ? 'bg-[#d97c4a] text-white'
              : 'bg-white border border-[#e7e1da] hover:bg-[#f0ebe6]'
          }`}
        >
          This Year
        </button>
      </div>

      {/* Popular Dishes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {popularDishes[timeframe as keyof typeof popularDishes].map((dish, index) => (
<div key={dish.id} className="bg-white rounded-xl border border-[#ece7e1] overflow-hidden hover:shadow-lg transition-all">
          <div className="h-32 bg-[#e7ddd2] flex items-center justify-center text-4xl">
              {dish.image}
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">{dish.name}</h3>
                  <p className="text-sm text-[#5f5b56]">{dish.restaurant}</p>
                </div>
                <span className="bg-[#f0ebe6] px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <TrendingUp size={12} className="text-green-600" />
                  {dish.trend}
                </span>
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-[#d97c4a]" fill="#d97c4a" />
                  <span className="text-sm font-medium">{dish.orders} orders</span>
                </div>
                <span className="text-xs text-[#5f5b56]">#{index + 1} trending</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}