import Link from 'next/link'
import { Star, Clock, MapPin } from 'lucide-react'

interface RestaurantCardProps {
  restaurant: {
    id: string
    name: string
    cuisine: string
    location: string
    rating: number
    deliveryTime: string
    image: string
    priceRange: string
    featured?: boolean
  }
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Link href={`/restaurants/${restaurant.id}`}>
      <div className="bg-white rounded-xl border border-[#ece7e1] overflow-hidden hover:shadow-lg transition-all hover:border-[#dbbca7]">
        {/* Image Placeholder - In production, use Next/Image */}
        <div className="h-40 bg-[#e7ddd2] relative">
          {restaurant.featured && (
            <span className="absolute top-2 left-2 bg-[#d97c4a] text-white text-xs px-2 py-1 rounded-full">
              Featured
            </span>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg">{restaurant.name}</h3>
            <span className="text-sm font-medium text-[#5f5b56]">{restaurant.priceRange}</span>
          </div>
          
          <p className="text-sm text-[#6f6b66] mb-3">{restaurant.cuisine}</p>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Star size={16} className="text-[#d97c4a]" fill="#d97c4a" />
              <span>{restaurant.rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={16} className="text-[#5f5b56]" />
              <span>{restaurant.deliveryTime}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 mt-3 text-xs text-[#7e786f]">
            <MapPin size={12} />
            <span>{restaurant.location}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}