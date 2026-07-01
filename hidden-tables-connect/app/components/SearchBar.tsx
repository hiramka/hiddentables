'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

export function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/restaurants?search=${encodeURIComponent(searchTerm.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSearch} className="relative w-full group">
      <input
        type="text"
        placeholder="Search restaurants or dishes..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-5 pr-12 py-3 rounded-full border border-gray-200 bg-white/50 backdrop-blur-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5A3C]/50 focus:border-[#FF5A3C] text-sm shadow-sm transition-all duration-300 group-hover:shadow-md text-gray-800"
      />
      <button 
        type="submit" 
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-[#FF5A3C] transition-colors rounded-full hover:bg-[#FF5A3C]/10"
      >
        <Search size={18} />
      </button>
    </form>
  )
}
