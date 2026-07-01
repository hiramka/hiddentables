'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Star, Plus, Filter, Loader2 } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { supabase } from '../../src/lib/supabaseClient'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image_url: string | null
  category: string
  available: boolean
  restaurant_id: string
  restaurants: {
    id: string
    name: string
    cuisine: string
  }
}

export default function MenuPage() {
  const { addItem } = useCart()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCuisine, setSelectedCuisine] = useState('all')
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchMenuItems()
  }, [])

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          id,
          name,
          description,
          price,
          image_url,
          category,
          available,
          restaurant_id,
          restaurants (
            id,
            name,
            cuisine
          )
        `)
        .eq('available', true)
        .order('name')

      if (error) throw error
      setMenuItems((data as unknown as MenuItem[]) || [])
    } catch (err: any) {
      console.error('Error fetching menu items:', err)
      setError('Failed to load menu items. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  // Build cuisine list dynamically from real data
  const cuisines = ['all', ...Array.from(
    new Set(menuItems.map(item => item.restaurants?.cuisine).filter(Boolean))
  )]

  const filteredItems = menuItems.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.restaurants?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCuisine =
      selectedCuisine === 'all' || item.restaurants?.cuisine === selectedCuisine
    return matchesSearch && matchesCuisine
  })

  const handleAddToCart = (item: MenuItem) => {
    // item.id is now a real UUID from Supabase
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,  // already in cents from DB
      restaurantId: item.restaurants?.id,
      restaurantName: item.restaurants?.name
    })

    // Show brief "Added!" feedback without alert()
    setAddedItems(prev => new Set(prev).add(item.id))
    setTimeout(() => {
      setAddedItems(prev => {
        const next = new Set(prev)
        next.delete(item.id)
        return next
      })
    }, 1500)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="animate-spin h-10 w-10 text-[#d97c4a]" />
        <p className="text-[#5f5b56]">Loading menu...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchMenuItems}
          className="bg-[#d97c4a] text-white px-6 py-2 rounded-full hover:bg-[#c26b3a] transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Menu Items</h1>
        <p className="text-[#5f5b56]">Discover popular dishes from our restaurants</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5f5b56]" />
          <input
            type="text"
            placeholder="Search dishes or restaurants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full border border-[#e7e1da] bg-white focus:outline-none focus:ring-2 focus:ring-[#d97c4a]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter size={18} className="text-[#5f5b56] hidden sm:block flex-shrink-0" />
          {cuisines.map((cuisine) => (
            <button
              key={cuisine}
              onClick={() => setSelectedCuisine(cuisine)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                selectedCuisine === cuisine
                  ? 'bg-[#d97c4a] text-white'
                  : 'bg-white border border-[#e7e1da] hover:bg-[#f0ebe6]'
              }`}
            >
              {cuisine === 'all' ? 'All' : cuisine}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[#5f5b56] mb-4">No menu items found</p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="bg-[#d97c4a] text-white px-6 py-2 rounded-full hover:bg-[#c26b3a] transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const isAdded = addedItems.has(item.id)
            return (
              <div key={item.id} className="bg-white rounded-xl border border-[#ece7e1] overflow-hidden hover:shadow-lg transition-all">
                <div className="h-32 bg-[#e7ddd2] flex items-center justify-center text-4xl overflow-hidden">
                  {item.image_url
                    ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    : <span>🍽️</span>
                  }
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 mr-2">
                      <h3 className="font-semibold">{item.name}</h3>
                      <Link
                        href={`/restaurant/${item.restaurants?.id}`}
                        className="text-sm text-[#d97c4a] hover:underline"
                      >
                        {item.restaurants?.name}
                      </Link>
                    </div>
                    <span className="bg-[#e7ddd2] text-[#1a1a1a] px-2 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                      KES {(item.price / 100).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </span>
                  </div>

                  {item.description && (
                    <p className="text-sm text-[#6f6b66] mb-3">{item.description}</p>
                  )}

                  {item.category && (
                    <span className="inline-block text-xs bg-[#f0ebe6] text-[#5f5b56] px-2 py-0.5 rounded-full mb-3">
                      {item.category}
                    </span>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#5f5b56]">{item.restaurants?.cuisine}</span>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 transition-all ${
                        isAdded
                          ? 'bg-green-500 text-white'
                          : 'bg-[#d97c4a] text-white hover:bg-[#c26b3a]'
                      }`}
                    >
                      {isAdded ? (
                        <>✓ Added</>
                      ) : (
                        <><Plus size={14} /> Add</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}