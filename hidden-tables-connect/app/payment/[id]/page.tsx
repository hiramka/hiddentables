'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, ShieldCheck, Loader2, Smartphone } from 'lucide-react'
import { supabase } from '../../../src/lib/supabaseClient'

interface Order {
  id: string
  user_id: string
  status: string
  total_amount: number
  phone_number: string
}

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params?.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  
  // Payment states
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'initiating' | 'awaiting_pin' | 'success' | 'failed'>('idle')

  useEffect(() => {
    if (!orderId) return

    const fetchOrder = async () => {
      setLoading(true)
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('Please login to complete payment.')
        setTimeout(() => router.push('/auth/login'), 2000)
        return
      }

      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('id, user_id, status, total_amount, phone_number')
        .eq('id', orderId)
        .single()

      if (fetchError || !data) {
        setError('Order not found or an error occurred.')
        setLoading(false)
        return
      }

      if (data.user_id !== session.user.id) {
        setError('You do not have permission to view this order.')
        setLoading(false)
        return
      }

      if (data.status !== 'awaiting_payment') {
        // If already paid or moved past payment, go to tracking
        router.push(`/order/tracking/${orderId}`)
        return
      }

      setOrder(data)
      setPhoneNumber(data.phone_number || '')
      setLoading(false)
    }

    fetchOrder()
  }, [orderId, router])

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phoneNumber) {
      setError('Please enter your M-Pesa phone number')
      return
    }
    
    setError('')
    setPaymentStatus('initiating')

    // Simulate STK Push delay
    setTimeout(() => {
      setPaymentStatus('awaiting_pin')
      
      // Simulate waiting for user to enter PIN
      setTimeout(async () => {
        try {
          // Update order status to pending
          const { error: updateError } = await supabase
            .from('orders')
            .update({ status: 'pending' })
            .eq('id', orderId)

          if (updateError) throw updateError

          setPaymentStatus('success')
          
          // Redirect to tracking page after 2 seconds
          setTimeout(() => {
            router.push(`/order/tracking/${orderId}`)
          }, 2000)

        } catch (err) {
          console.error('Payment update error:', err)
          setPaymentStatus('failed')
          setError('Failed to update order status. Please contact support.')
        }
      }, 4000)
    }, 1500)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin h-12 w-12 text-[#d97c4a] mb-4" />
        <p className="text-gray-800 font-medium">Loading payment details...</p>
      </div>
    )
  }

  if (error && paymentStatus === 'idle') {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-6">
          {error}
        </div>
        <Link href="/orders" className="text-[#d97c4a] hover:underline">
          Go to My Orders
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto py-12 px-4 animate-in slide-in-from-bottom-4 duration-500">
      <Link href="/cart" className="inline-flex items-center gap-2 text-gray-700 hover:text-[#FF5A3C] font-semibold transition-colors group w-fit mb-8">
        <div className="bg-white p-2 rounded-full shadow-sm group-hover:shadow group-hover:-translate-x-1 transition-all">
          <ArrowLeft size={16} />
        </div>
        Back
      </Link>

      <div className="bg-white rounded-3xl p-8 md:p-10 border border-gray-100 shadow-xl relative overflow-hidden">
        {/* Top design accent */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#FF5A3C] to-[#FFC857]"></div>
        
        {/* Decorative background blur */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-[#FF5A3C]/10 to-[#FFC857]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center mb-10 relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-50 to-green-100 text-green-500 rounded-full mb-6 shadow-inner">
            <Smartphone size={36} className="animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Complete Payment</h1>
          <p className="text-gray-700 font-medium">Pay with M-Pesa to confirm your order.</p>
        </div>

        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8 relative z-10">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-700 font-semibold">Order ID</span>
            <span className="font-mono font-bold text-sm bg-white px-3 py-1 rounded-lg border border-gray-100 shadow-sm text-gray-800">#{orderId.split('-')[0]}</span>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-gray-200/60">
            <span className="text-lg text-gray-900 font-medium">Total Amount</span>
            <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#FF5A3C] to-[#E64A2E]">
              <span className="text-sm text-gray-700 font-semibold mr-1">KES</span>
              {((order?.total_amount || 0) / 100).toFixed(2)}
            </span>
          </div>
        </div>

        {paymentStatus === 'idle' || paymentStatus === 'failed' ? (
          <form onSubmit={handlePayment} className="space-y-6 relative z-10">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5"><span className="text-red-500 font-bold text-xs">!</span></div>
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">M-Pesa Phone Number</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 font-bold">+254</span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="712345678"
                  className="w-full pl-16 pr-4 py-4 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF5A3C]/20 focus:border-[#FF5A3C] transition-all font-medium text-gray-900"
                  required
                />
              </div>
              <p className="text-xs text-gray-700 mt-3 flex items-center gap-1.5 font-semibold">
                <ShieldCheck size={16} className="text-green-500" />
                Secure payment via Safaricom STK Push
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:shadow-xl hover:from-green-600 hover:to-green-700 transition-all transform hover:-translate-y-1 active:scale-95 flex justify-center items-center gap-2"
            >
              Pay KES {((order?.total_amount || 0) / 100).toFixed(2)}
              <ArrowLeft size={18} className="rotate-180" />
            </button>
          </form>
        ) : (
          <div className="py-10 text-center flex flex-col items-center relative z-10 animate-in fade-in zoom-in duration-500">
            {paymentStatus === 'initiating' && (
              <>
                <div className="relative w-20 h-20 flex items-center justify-center mb-6">
                  <div className="absolute inset-0 border-4 border-green-100 border-t-green-500 rounded-full animate-spin"></div>
                  <Loader2 className="animate-spin h-8 w-8 text-green-500 absolute" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Initiating Payment</h3>
                <p className="text-gray-700 font-medium">Connecting to M-Pesa...</p>
              </>
            )}
            
            {paymentStatus === 'awaiting_pin' && (
              <>
                <div className="relative w-24 h-24 flex items-center justify-center mb-6">
                  <div className="absolute inset-0 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center animate-pulse">
                    <Smartphone className="text-green-500" size={32} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Check Your Phone</h3>
                <p className="text-gray-700 font-medium max-w-[280px] leading-relaxed">
                  An M-Pesa prompt has been sent to <span className="font-bold text-gray-900">{phoneNumber}</span>. Please enter your PIN to authorize the payment.
                </p>
              </>
            )}
            
            {paymentStatus === 'success' && (
              <>
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-500/30 animate-bounce">
                  <CheckCircle2 className="text-white" size={48} />
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Payment Successful!</h3>
                <p className="text-gray-700 mb-8 font-semibold">Your order has been confirmed.</p>
                <div className="bg-gray-50 px-6 py-3 rounded-full flex items-center gap-3 border border-gray-100">
                  <Loader2 className="animate-spin h-5 w-5 text-[#FF5A3C]" />
                  <span className="text-gray-700 font-semibold">Redirecting to order tracking...</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
