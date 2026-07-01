'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  User, 
  MapPin, 
  CreditCard, 
  Clock, 
  Heart,
  Settings,
  LogOut,
  ChevronRight,
  Edit2
} from 'lucide-react'

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile')

  const user = {
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '+254 712 345 678',
    address: '123 Kenyatta Ave, Kilimani, Nairobi',
    memberSince: 'January 2024',
    totalOrders: 24
  }

  const recentOrders = [
    { id: '12345', restaurant: "Mama Jane's Kitchen", date: '2024-01-15', total: 1730, status: 'Delivered' },
    { id: '12344', restaurant: 'Kafe Central', date: '2024-01-14', total: 2450, status: 'Delivered' },
    { id: '12343', restaurant: 'The Alley', date: '2024-01-12', total: 3200, status: 'Delivered' }
  ]

  const savedAddresses = [
    { label: 'Home', address: '123 Kenyatta Ave, Kilimani, Nairobi', default: true },
    { label: 'Work', address: '456 Westlands Rd, Westlands, Nairobi', default: false }
  ]

  const favorites = [
    { name: "Mama Jane's Kitchen", cuisine: 'Swahili', rating: 4.8 },
    { name: 'Kafe Central', cuisine: 'Continental', rating: 4.5 }
  ]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-xl p-6 border border-[#ece7e1] mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="w-20 h-20 bg-[#e7ddd2] rounded-full flex items-center justify-center">
            <User size={40} className="text-[#d97c4a]" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-[#5f5b56]">{user.email}</p>
            <div className="flex flex-wrap gap-4 mt-2 justify-center sm:justify-start">
              <span className="text-sm flex items-center gap-1">
                <Clock size={14} className="text-[#d97c4a]" />
                Member since {user.memberSince}
              </span>
              <span className="text-sm flex items-center gap-1">
                <Heart size={14} className="text-[#d97c4a]" />
                {user.totalOrders} orders
              </span>
            </div>
          </div>
          <button className="sm:self-start bg-[#f0ebe6] text-[#1a1a1a] px-4 py-2 rounded-full text-sm flex items-center gap-2 hover:bg-[#ece7e1] transition-colors">
            <Edit2 size={14} />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 mb-6 pb-2">
        {[
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'orders', label: 'Orders', icon: Clock },
          { id: 'addresses', label: 'Addresses', icon: MapPin },
          { id: 'payment', label: 'Payment', icon: CreditCard },
          { id: 'favorites', label: 'Favorites', icon: Heart },
          { id: 'settings', label: 'Settings', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors
                ${activeTab === tab.id 
                  ? 'bg-[#d97c4a] text-white' 
                  : 'bg-white border border-[#ece7e1] hover:bg-[#f0ebe6]'}`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-[#ece7e1] p-6">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-[#5f5b56]">Full Name</label>
                <p className="font-medium">{user.name}</p>
              </div>
              <div>
                <label className="text-sm text-[#5f5b56]">Email</label>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <label className="text-sm text-[#5f5b56]">Phone</label>
                <p className="font-medium">{user.phone}</p>
              </div>
              <div>
                <label className="text-sm text-[#5f5b56]">Default Address</label>
                <p className="font-medium">{user.address}</p>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <Link 
                key={order.id}
                href={`/order/tracking/${order.id}`}
                className="block border border-[#ece7e1] rounded-lg p-4 hover:border-[#dbbca7] transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{order.restaurant}</p>
                    <p className="text-sm text-[#5f5b56]">Order #{order.id}</p>
                    <p className="text-sm text-[#5f5b56]">{new Date(order.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">KES {order.total}</p>
                    <p className={`text-sm ${
                      order.status === 'Delivered' ? 'text-green-600' : 'text-[#d97c4a]'
                    }`}>
                      {order.status}
                    </p>
                    <ChevronRight size={16} className="text-[#5f5b56] mt-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div className="space-y-4">
            {savedAddresses.map((address, index) => (
              <div key={index} className="border border-[#ece7e1] rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{address.label}</p>
                    <p className="text-sm text-[#5f5b56]">{address.address}</p>
                  </div>
                  {address.default && (
                    <span className="bg-[#d97c4a] text-white text-xs px-2 py-1 rounded-full">
                      Default
                    </span>
                  )}
                </div>
              </div>
            ))}
            <button className="w-full border border-dashed border-[#e7e1da] rounded-lg p-4 text-[#d97c4a] hover:bg-[#fcfaf7] transition-colors">
              + Add New Address
            </button>
          </div>
        )}

        {/* Payment Tab - Add payment methods UI */}
        {activeTab === 'payment' && (
          <div className="space-y-4">
            <div className="border border-[#ece7e1] rounded-lg p-4">
              <h3 className="font-medium mb-3">Payment Methods</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-[#fcfaf7] rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard size={20} className="text-[#d97c4a]" />
                    <div>
                      <p className="font-medium">M-Pesa</p>
                      <p className="text-sm text-[#5f5b56]">**** **** 1234</p>
                    </div>
                  </div>
                  <span className="bg-[#d97c4a] text-white text-xs px-2 py-1 rounded-full">Default</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#fcfaf7] rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard size={20} className="text-[#d97c4a]" />
                    <div>
                      <p className="font-medium">Visa</p>
                      <p className="text-sm text-[#5f5b56]">**** **** 5678</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button className="w-full border border-dashed border-[#e7e1da] rounded-lg p-4 text-[#d97c4a] hover:bg-[#fcfaf7] transition-colors">
              + Add Payment Method
            </button>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className="border border-[#ece7e1] rounded-lg p-4">
              <h3 className="font-medium mb-3">Notifications</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded text-[#d97c4a]" defaultChecked />
                  <span>Email notifications</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded text-[#d97c4a]" defaultChecked />
                  <span>SMS notifications</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded text-[#d97c4a]" />
                  <span>Push notifications</span>
                </label>
              </div>
            </div>
            <div className="border border-[#ece7e1] rounded-lg p-4">
              <h3 className="font-medium mb-3">Preferences</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded text-[#d97c4a]" defaultChecked />
                  <span>Dark mode</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded text-[#d97c4a]" />
                  <span>Save order history</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <div className="space-y-4">
            {favorites.map((fav, index) => (
              <div key={index} className="border border-[#ece7e1] rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{fav.name}</p>
                    <p className="text-sm text-[#5f5b56]">{fav.cuisine}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">⭐ {fav.rating}</span>
                    <Link 
                      href={`/restaurants/${fav.name.toLowerCase().replace(/'/g, '').replace(/\s+/g, '-')}`}
                      className="text-[#d97c4a] text-sm hover:underline"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Logout Button */}
      <button className="w-full sm:w-auto mt-6 bg-white border border-red-200 text-red-500 px-6 py-3 rounded-full hover:bg-red-50 transition-colors flex items-center justify-center gap-2 mx-auto">
        <LogOut size={16} />
        Log Out
      </button>
    </div>
  )
}