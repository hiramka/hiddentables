'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { Star, MapPin, Clock, Search } from 'lucide-react'
import { supabase } from '../../src/lib/supabaseClient'
import { useSearchParams } from 'next/navigation'

function RestaurantsContent() {
  const searchParams = useSearchParams()
  const initialSearch = searchParams?.get('search') || ''

  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [locations, setLocations] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRestaurants()
  }, [])

  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name, cuisine, location, rating, delivery_time')
        .order('rating', { ascending: false })

      if (error) throw error
      
      const fetchedRestaurants = data || []
      setRestaurants(fetchedRestaurants)
      
      // Extract unique locations for the filter
      const uniqueLocations = Array.from(
        new Set(fetchedRestaurants.map(r => r.location).filter(Boolean))
      )
      setLocations(uniqueLocations)

    } catch (error: any) {
      console.error('Error fetching restaurants (detailed):', {
        rawError: error,
        message: error?.message,
        code: error?.code,
        details: error?.details,
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredRestaurants = restaurants.filter(restaurant => {
    const name = typeof restaurant?.name === 'string' ? restaurant.name.toLowerCase() : ''
    const cuisine = typeof restaurant?.cuisine === 'string' ? restaurant.cuisine.toLowerCase() : ''
    const term = searchTerm.toLowerCase()

    const matchesSearch = name.includes(term) || cuisine.includes(term)
    const matchesLocation = selectedLocation === 'all' || restaurant.location === selectedLocation

    return matchesSearch && matchesLocation
  })

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Discover Hidden Restaurants</h1>
        <p className="text-gray-700 font-medium">Find unique dining experiences in your area</p>
      </div>

      {/* Filters & Search */}
      <div className="mb-10 flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative w-full sm:w-96 group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF5A3C] transition-colors" />
          <input
            type="text"
            placeholder="Search restaurants or cuisine..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5A3C]/50 focus:border-[#FF5A3C] transition-all text-gray-800 font-medium"
          />
        </div>

        <div className="w-full sm:w-auto flex items-center gap-3">
          <MapPin size={18} className="text-gray-500 hidden sm:block" />
          <select 
            value={selectedLocation} 
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full sm:w-48 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5A3C]/50 focus:border-[#FF5A3C] transition-all text-gray-800 font-medium appearance-none cursor-pointer"
          >
            <option value="all">All Locations</option>
            {locations.map((loc, idx) => (
              <option key={idx} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin w-10 h-10 border-4 border-[#FF5A3C]/20 border-t-[#FF5A3C] rounded-full mb-4"></div>
          <p className="text-gray-700 font-medium">Loading restaurants...</p>
        </div>
      )}

      {/* Restaurants Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant) => (
            <Link
              key={restaurant.id}
              href={`/restaurant/${restaurant.id}`}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="h-48 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF5A3C]/10 to-[#FFC857]/10 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="text-gray-500 text-sm font-medium z-10">Restaurant Image</div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-xl text-gray-900 group-hover:text-[#FF5A3C] transition-colors">{restaurant.name}</h3>
                  <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                    <Star size={14} className="text-[#FFC857]" fill="#FFC857" />
                    <span className="font-bold text-sm">{restaurant.rating}</span>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm font-medium mb-4">{restaurant.cuisine}</p>

                <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                    <MapPin size={16} className="text-gray-400" />
                    <span>{restaurant.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                    <Clock size={16} className="text-[#FF5A3C]" />
                    <span>{restaurant.delivery_time}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && filteredRestaurants.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-700 font-semibold mb-4 text-lg">No restaurants found matching your search</p>
          <button
            onClick={() => {
              setSearchTerm('')
              setSelectedLocation('all')
            }}
            className="bg-[#FF5A3C] text-white px-6 py-2.5 rounded-full hover:bg-[#E64A2E] transition-colors font-bold shadow-md hover:shadow-lg active:scale-95"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}

export default function RestaurantsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin w-10 h-10 border-4 border-[#FF5A3C]/20 border-t-[#FF5A3C] rounded-full mb-4"></div>
        <p className="text-gray-700 font-medium">Loading search...</p>
      </div>
    }>
      <RestaurantsContent />
    </Suspense>
  )
}