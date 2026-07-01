'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Truck, Clock, CheckCircle, MapPin, ArrowLeft } from 'lucide-react'
import { supabase } from '../../../../src/lib/supabaseClient'

// Define proper types
interface Restaurant {
  id: string
  name: string
  [key: string]: any
}

interface OrderItem {
  id?: string
  order_id: string
  menu_item_id: string
  quantity: number
  price: number
  name?: string
  restaurant_name?: string
}

interface Order {
  id: string
  user_id: string
  restaurant_id: string
  status: string
  total_amount: number
  delivery_address?: string
  estimated_delivery?: string
  created_at: string
  rating?: number
  restaurant?: Restaurant
  order_items?: OrderItem[]
}

export default function OrderTrackingPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params?.id as string
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orderId) return

    const fetchOrder = async () => {
      setLoading(true)
      
      // First check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('Please login to view your orders')
        setLoading(false)
        setTimeout(() => router.push('/auth/login'), 2000)
        return
      }

      const { data, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          restaurant:restaurants(*),
          order_items:order_items(*)
        `)
        .eq('id', orderId)
        .single()

      if (fetchError) {
        console.error('Fetch order error:', fetchError)
        setError(fetchError.message === 'Not found' ? 'Order not found' : fetchError.message)
        setLoading(false)
        return
      }

      // Verify the order belongs to the current user
      if (data.user_id !== session.user.id) {
        setError('You do not have permission to view this order')
        setLoading(false)
        return
      }

      if (data.status === 'awaiting_payment') {
        router.push(`/payment/${orderId}`)
        return
      }

      setOrder(data as Order)
      setLoading(false)
    }

    fetchOrder()

    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`order-${orderId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`
      }, (payload) => {
        console.log('Order update received:', payload.new)
        setOrder(payload.new as Order)
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [orderId, router])

  const getStatusSteps = () => {
    const steps = [
      { status: 'pending', label: 'Order confirmed', icon: CheckCircle },
      { status: 'preparing', label: 'Preparing your order', icon: Clock },
      { status: 'dispatched', label: 'Order dispatched', icon: Truck },
      { status: 'out_for_delivery', label: 'Out for delivery', icon: MapPin },
      { status: 'delivered', label: 'Delivered', icon: CheckCircle }
    ]

    const currentIndex = steps.findIndex(step => step.status === order?.status)
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex
    }))
  }

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      pending: 'bg-gray-100 text-gray-700',
      preparing: 'bg-yellow-100 text-yellow-700',
      dispatched: 'bg-blue-100 text-blue-700',
      out_for_delivery: 'bg-green-100 text-green-700',
      delivered: 'bg-purple-100 text-purple-700'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d97c4a] mx-auto"></div>
        <p className="mt-4 text-[#5f5b56]">Loading order details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg mb-4">
          {error}
        </div>
        <Link href="/orders" className="text-[#d97c4a] hover:underline">
          ← Back to orders
        </Link>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <p className="text-[#5f5b56] mb-4">Order not found</p>
        <Link href="/orders" className="text-[#d97c4a] hover:underline">
          ← Back to orders
        </Link>
      </div>
    )
  }

  const statusSteps = getStatusSteps()

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Link href="/orders" className="inline-flex items-center gap-2 text-[#5f5b56] hover:text-[#d97c4a] mb-6">
        <ArrowLeft size={18} />
        Back to orders
      </Link>

      <h1 className="text-2xl font-bold mb-2">Order Tracking</h1>
      <p className="text-[#5f5b56] mb-6">
        Track your order #{orderId.slice(0, 8)} in real time.
      </p>

      <div className="bg-white rounded-xl border border-[#ece7e1] p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="font-semibold text-lg">{order.restaurant?.name || 'Restaurant'}</h2>
            <p className="text-sm text-[#5f5b56] mt-1">
              Order placed {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full capitalize ${getStatusColor(order.status)}`}>
            {order.status.replace('_', ' ')}
          </span>
        </div>

        {/* Delivery Address */}
        {order.delivery_address && (
          <div className="border-t border-[#ece7e1] pt-4">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <MapPin size={18} className="text-[#d97c4a]" />
              Delivery Address
            </h3>
            <p className="text-[#5f5b56]">{order.delivery_address}</p>
          </div>
        )}

        {/* Order Items */}
        {order.order_items && order.order_items.length > 0 && (
          <div className="border-t border-[#ece7e1] pt-4">
            <h3 className="font-medium mb-3">Order Items</h3>
            <div className="space-y-2">
              {order.order_items.map((item: OrderItem) => (
                <div key={item.id || `${item.menu_item_id}-${item.quantity}`} className="flex justify-between text-sm">
                  <span>
                    {item.quantity} × {item.name || `Item #${item.menu_item_id}`}
                  </span>
                  <span className="font-medium">
                    KES {((item.price * item.quantity) / 100).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order Status Timeline */}
        <div className="border-t border-[#ece7e1] pt-4">
          <h3 className="font-medium mb-4">Order Status</h3>
          <div className="space-y-4">
            {statusSteps.map((step) => {
              const Icon = step.icon
              return (
                <div key={step.status} className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    step.completed ? 'bg-[#d97c4a] text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${
                      step.current ? 'text-[#d97c4a]' : 
                      step.completed ? 'text-black' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </p>
                    {step.current && order.estimated_delivery && (
                      <p className="text-sm text-[#5f5b56] mt-0.5">
                        Estimated delivery: {new Date(order.estimated_delivery).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Rating Section */}
        {order.status === 'delivered' && !order.rating && (
          <div className="border-t border-[#ece7e1] pt-4">
            <p className="font-medium mb-2">How was your experience?</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={async () => {
                    const { error: updateError } = await supabase
                      .from('orders')
                      .update({ rating: star })
                      .eq('id', orderId)
                    
                    if (!updateError) {
                      setOrder({ ...order, rating: star })
                    }
                  }}
                  className={`text-2xl transition-colors ${
                    order.rating && star <= order.rating ? 'text-[#d97c4a]' : 'text-[#e7e1da] hover:text-[#d97c4a]'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="border-t border-[#ece7e1] pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-[#5f5b56]">Total</span>
            <span className="font-semibold">KES {((order.total_amount || 0) / 100).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}