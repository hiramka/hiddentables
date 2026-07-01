'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import {
  Store,
  TrendingUp,
  Clock,
  DollarSign,
  Package,
  Settings,
  Menu,
  Users,
  MessageCircle,
  Send
} from 'lucide-react'
import { supabase } from '../../../src/lib/supabaseClient'

export default function RestaurantDashboardPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [newSupportMessage, setNewSupportMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('orders')
        .select('*, restaurant(*), order_items(*)')
        .order('created_at', { ascending: false })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      setOrders(data || [])
      setLoading(false)
    }

    const loadChatMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error loading chat messages:', error)
      } else {
        setChatMessages(data || [])
      }
    }

    loadOrders()
    loadChatMessages()

    // Subscribe to new chat messages
    const channel = supabase
      .channel('support_chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          setChatMessages(prev => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)

    if (error) {
      setError(error.message)
      return
    }

    setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
  }

  const sendSupportMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSupportMessage.trim()) return

    const { error } = await supabase
      .from('chat_messages')
      .insert([
        {
          user_id: '00000000-0000-0000-0000-000000000000', // Support user ID
          message: newSupportMessage.trim(),
          is_support: true
        }
      ])

    if (error) {
      console.error('Error sending support message:', error)
    } else {
      setNewSupportMessage('')
    }
  }

  const stats = {
    todayOrders: orders.filter((order) => new Date(order.created_at).toDateString() === new Date().toDateString()).length,
    todayRevenue: orders.reduce((sum, order) => sum + (order.total_amount || 0), 0),
    activeOrders: orders.filter((order) => order.status !== 'delivered' && order.status !== 'cancelled').length,
    totalCustomers: new Set(orders.map((order) => order.user_id)).size
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Store className="text-[#d97c4a]" />
            Restaurant Dashboard
          </h1>
          <p className="text-[#5f5b56]">Mama Jane's Kitchen · Kilimani</p>
        </div>
        
        <div className="flex gap-2">
          <Link 
            href="/dashboard/restaurant/menu"
            className="bg-[#d97c4a] text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-[#c26b3a] transition-colors"
          >
            <Menu size={16} />
            Manage Menu
          </Link>
          <Link 
            href="/dashboard/restaurant/settings"
            className="bg-white border border-[#e7e1da] px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-[#f0ebe6] transition-colors"
          >
            <Settings size={16} />
            Settings
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-[#ece7e1]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#5f5b56]">Today's Orders</span>
            <Package size={20} className="text-[#d97c4a]" />
          </div>
          <p className="text-2xl font-bold">{stats.todayOrders}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-[#ece7e1]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#5f5b56]">Revenue</span>
            <DollarSign size={20} className="text-[#d97c4a]" />
          </div>
          <p className="text-2xl font-bold">KES {stats.todayRevenue}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-[#ece7e1]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#5f5b56]">Active Orders</span>
            <Clock size={20} className="text-[#d97c4a]" />
          </div>
          <p className="text-2xl font-bold">{stats.activeOrders}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-[#ece7e1]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#5f5b56]">Total Customers</span>
            <Users size={20} className="text-[#d97c4a]" />
          </div>
          <p className="text-2xl font-bold">{stats.totalCustomers}</p>
        </div>
      </div>

      {/* Chat Support */}
      <div className="bg-white rounded-xl border border-[#ece7e1] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            <MessageCircle size={20} className="text-[#d97c4a]" />
            Customer Support Chat
          </h2>
          <Link
            href="/chat"
            className="text-sm text-[#d97c4a] hover:underline"
          >
            View Full Chat
          </Link>
        </div>

        {/* Chat Messages */}
        <div className="bg-[#fcfaf7] rounded-lg p-4 mb-4 max-h-64 overflow-y-auto">
          {chatMessages.length === 0 ? (
            <div className="text-center">
              <MessageCircle size={32} className="mx-auto text-[#d97c4a] mb-2 opacity-50" />
              <p className="text-sm text-[#5f5b56]">No messages yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {chatMessages.slice(-5).map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.is_support ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      message.is_support
                        ? 'bg-[#d97c4a] text-white'
                        : 'bg-white border border-[#e7e1da] text-[#1a1a1a]'
                    }`}
                  >
                    {message.message}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Send Message Form */}
        <form onSubmit={sendSupportMessage} className="flex gap-2">
          <input
            type="text"
            value={newSupportMessage}
            onChange={(e) => setNewSupportMessage(e.target.value)}
            placeholder="Type support message..."
            className="flex-1 px-3 py-2 border border-[#e7e1da] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d97c4a]"
          />
          <button
            type="submit"
            disabled={!newSupportMessage.trim()}
            className="bg-[#d97c4a] text-white px-3 py-2 rounded-lg hover:bg-[#c26b3a] transition-colors disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </form>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-[#ece7e1] overflow-hidden">
        <div className="bg-[#fcfaf7] p-4 border-b border-[#ece7e1]">
          <h2 className="font-semibold">Recent Orders</h2>
        </div>
        
        <div className="divide-y divide-[#ece7e1]">
          {orders.slice(0, 10).map((order) => (
            <div key={order.id} className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-[#5f5b56]">{order.user_id} · {(order.order_items || []).length} items</p>
                  <p className="text-xs text-[#5f5b56] mt-1">{new Date(order.created_at).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">KES {(order.total_amount/100).toFixed(2)}</p>
                  <div className="flex gap-2 mt-2">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => updateStatus(order.id, 'preparing')}
                        className="text-xs bg-[#d97c4a] text-white px-2 py-1 rounded hover:bg-[#c26b3a]"
                      >
                        Start Preparing
                      </button>
                    )}
                    {order.status === 'preparing' && (
                      <button
                        onClick={() => updateStatus(order.id, 'dispatched')}
                        className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                      >
                        Mark Dispatched
                      </button>
                    )}
                    {order.status === 'dispatched' && (
                      <button
                        onClick={() => updateStatus(order.id, 'out_for_delivery')}
                        className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                      >
                        Out for Delivery
                      </button>
                    )}
                    {order.status === 'out_for_delivery' && (
                      <button
                        onClick={() => updateStatus(order.id, 'delivered')}
                        className="text-xs bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600"
                      >
                        Mark Delivered
                      </button>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                    order.status === 'pending' ? 'bg-gray-100 text-gray-700' :
                    order.status === 'preparing' ? 'bg-yellow-100 text-yellow-700' :
                    order.status === 'dispatched' ? 'bg-blue-100 text-blue-700' :
                    order.status === 'out_for_delivery' ? 'bg-green-100 text-green-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {order.status.replace('_', ' ').charAt(0).toUpperCase() + order.status.replace('_', ' ').slice(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link 
          href="/dashboard/restaurant/analytics"
          className="bg-white p-4 rounded-xl border border-[#ece7e1] hover:border-[#dbbca7] transition-colors"
        >
          <TrendingUp size={24} className="text-[#d97c4a] mb-2" />
          <h3 className="font-medium">Analytics</h3>
          <p className="text-xs text-[#5f5b56]">View detailed reports</p>
        </Link>
        
        <Link 
          href="/dashboard/restaurant/menu"
          className="bg-white p-4 rounded-xl border border-[#ece7e1] hover:border-[#dbbca7] transition-colors"
        >
          <Menu size={24} className="text-[#d97c4a] mb-2" />
          <h3 className="font-medium">Menu Management</h3>
          <p className="text-xs text-[#5f5b56]">Add or edit items</p>
        </Link>
        
        <Link 
          href="/dashboard/restaurant/settings"
          className="bg-white p-4 rounded-xl border border-[#ece7e1] hover:border-[#dbbca7] transition-colors"
        >
          <Settings size={24} className="text-[#d97c4a] mb-2" />
          <h3 className="font-medium">Settings</h3>
          <p className="text-xs text-[#5f5b56]">Hours, delivery radius</p>
        </Link>
      </div>
    </div>
  )
}