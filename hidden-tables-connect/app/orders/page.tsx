'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, Clock, ChevronRight, Star } from 'lucide-react'
import { supabase } from '../../src/lib/supabaseClient'

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('active')
  const [orders, setOrders] = useState<{ active: any[]; past: any[] }>({ active: [], past: [] })
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const currentUser = sessionData?.session?.user
      if (!currentUser) {
        return
      }

      setUser(currentUser)

      const { data: ordersData, error } = await supabase
        .from('orders')
        .select('*, restaurant(*), order_items(*)')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error(error)
        setLoading(false)
        return
      }

      const activeOrders = ordersData.filter((order) => order.status !== 'completed')
      const pastOrders = ordersData.filter((order) => order.status === 'completed')
      setOrders({ active: activeOrders, past: pastOrders })
      setLoading(false)
    }

    fetchOrders()
  }, [])

  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId)
    if (!error) {
      setOrders((prev) => ({
        active: prev.active.map((o) => (o.id === orderId ? { ...o, status } : o)),
        past: prev.past
      }))
    }
  }

  const rateOrder = async (orderId: string, rating: number) => {
    const { error } = await supabase.from('orders').update({ rating, status: 'completed' }).eq('id', orderId)
    if (!error) {
      setOrders((prev) => ({
        active: prev.active.map((o) => (o.id === orderId ? { ...o, rating, status: 'completed' } : o)),
        past: [...prev.past, ...prev.active.filter((o) => o.id === orderId)]
      }))
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading orders...</div>
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparing':
        return 'bg-yellow-100 text-yellow-700'
      case 'delivering':
        return 'bg-blue-100 text-blue-700'
      case 'delivered':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-3 rounded-full text-center transition-colors ${
            activeTab === 'active'
              ? 'bg-[#d97c4a] text-white'
              : 'bg-white border border-[#e7e1da] hover:bg-[#f0ebe6]'
          }`}
        >
          Active Orders ({orders.active.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`flex-1 py-3 rounded-full text-center transition-colors ${
            activeTab === 'past'
              ? 'bg-[#d97c4a] text-white'
              : 'bg-white border border-[#e7e1da] hover:bg-[#f0ebe6]'
          }`}
        >
          Past Orders ({orders.past.length})
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {activeTab === 'active' && orders.active.map((order) => (
          <Link
            key={order.id}
            href={`/order/tracking/${order.id}`}
            className="block bg-white rounded-xl border border-[#ece7e1] p-4 hover:shadow-lg transition-all"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold">{order.restaurant?.name || 'Unknown Restaurant'}</h3>
                <p className="text-sm text-[#5f5b56]">Order #{order.id}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
              </span>
            </div>

            <div className="space-y-1 mb-3">
              {(order.order_items || []).map((item: any, idx: number) => (
                <p key={idx} className="text-sm text-[#6f6b66]">
                  {item.quantity}x {item.menu_item_id || item.name}
                </p>
              ))}
            </div>

            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-[#d97c4a]" />
                <span>{order.estimated_delivery ? `Est. ${new Date(order.estimated_delivery).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 'No ETA'}</span>
              </div>
              <span className="font-semibold">KES {(order.total_amount/100).toFixed(2)}</span>
            </div>
          </Link>
        ))}

        {activeTab === 'past' && orders.past.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-xl border border-[#ece7e1] p-4"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold">{order.restaurant?.name || 'Unknown Restaurant'}</h3>
                <p className="text-sm text-[#5f5b56]">Order #{order.id}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
              </span>
            </div>

            <div className="space-y-1 mb-3">
              {(order.order_items || []).map((item: any, idx: number) => (
                <p key={idx} className="text-sm text-[#6f6b66]">
                  {item.quantity}x {item.menu_item_id || item.name}
                </p>
              ))}
            </div>

            <div className="flex justify-between items-center mb-3 text-sm">
              <span className="text-[#5f5b56]">
                {order.delivered_at ? new Date(order.delivered_at).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'Delivery timestamp not available'}
              </span>
              <span className="font-semibold">KES {(order.total_amount/100).toFixed(2)}</span>
            </div>

            {order.status === 'delivered' && !order.rating && (
              <div className="border-t border-[#ece7e1] pt-3 mt-3">
                <button
                  onClick={() => {
                    // Confirm receipt and allow rating
                    setOrders((prev) => ({
                      ...prev,
                      past: prev.past.map((o) => o.id === order.id ? { ...o, status: 'completed' } : o)
                    }))
                  }}
                  className="bg-[#d97c4a] text-white px-4 py-2 rounded-full text-sm hover:bg-[#c26b3a] mr-2"
                >
                  Confirm Receipt
                </button>
                <p className="text-sm text-[#5f5b56] mt-2">Rate your meal after confirming</p>
              </div>
            )}

            {order.status === 'completed' && !order.rating && (
              <div className="border-t border-[#ece7e1] pt-3 mt-3">
                <p className="text-sm text-[#5f5b56] mb-2">Rate your meal</p>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className="p-1 hover:scale-110 transition-transform"
                      onClick={() => rateOrder(order.id, star)}
                    >
                      <Star
                        size={20}
                        className="text-[#e7e1da] hover:text-[#d97c4a]"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Link
              href={`/restaurants/${order.restaurant?.id || order.restaurant_id}`}
              className="mt-3 inline-flex items-center gap-1 text-sm text-[#d97c4a] hover:underline"
            >
              Order again
              <ChevronRight size={14} />
            </Link>
          </div>
        ))}

        {activeTab === 'active' && orders.active.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-[#ece7e1]">
            <Package size={48} className="mx-auto text-[#5f5b56] mb-4" />
            <h3 className="font-semibold mb-2">No active orders</h3>
            <p className="text-[#5f5b56] mb-4">Hungry? Browse our restaurants</p>
            <Link
              href="/restaurants"
              className="inline-block bg-[#d97c4a] text-white px-6 py-2 rounded-full hover:bg-[#c26b3a]"
            >
              Order Now
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}