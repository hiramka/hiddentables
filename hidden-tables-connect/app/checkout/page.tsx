'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '../context/CartContext'
import { supabase } from '../../src/lib/supabaseClient'
import { MapPin, AlertCircle, Loader2 } from 'lucide-react'

interface Session {
  user: {
    id: string
    email?: string
    user_metadata?: {
      name?: string
      full_name?: string
    }
  }
}

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  restaurantId: string
  restaurantName: string
}

interface Order {
  user_id: string
  restaurant_id: string
  status: string
  total_amount: number
  total_price: number
  delivery_address: string
  phone_number: string
  created_at: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, deliveryFee, total, clearCart } = useCart()
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [session, setSession] = useState<Session | null>(null)
  const [deliveryAddress, setDeliveryAddress] = useState({
    streetAddress: '',
    city: '',
    postalCode: '',
    phoneNumber: ''
  })

  useEffect(() => {
    const loadSession = async () => {
      try {
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('Session error:', sessionError)
          setError('Authentication error. Please try logging in again.')
          setTimeout(() => router.push('/auth/login'), 2000)
          return
        }

        if (!currentSession || !currentSession.user?.id) {
          setError('Please login to place an order.')
          setTimeout(() => router.push('/auth/login'), 2000)
          return
        }

        setSession(currentSession as Session)
      } catch (err) {
        console.error('Unexpected error loading session:', err)
        setError('An error occurred. Please refresh the page.')
      }
    }

    loadSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!newSession) {
        setError('Your session has expired. Please login again.')
        setTimeout(() => router.push('/auth/login'), 2000)
      } else {
        setSession(newSession as Session)
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setDeliveryAddress((prev) => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const isValidUuid = (value: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return uuidRegex.test(value)
  }

  const resolveRestaurantId = async (restaurantId: string): Promise<string> => {
    if (isValidUuid(restaurantId)) return restaurantId

    const nameMapping: Record<string, string> = {
      'root-restaurant': "Mama Jane's Kitchen",
      'mama-janes': "Mama Jane's Kitchen",
      'swahili-deli': 'Swahili Deli',
      'kafe-central': 'Kafe Central',
      'the-alley': 'The Alley'
    }

    const lookupName = nameMapping[restaurantId] || restaurantId
    console.log('Looking for restaurant name:', lookupName)

    const { data: restaurantRecord, error: nameError } = await supabase
      .from('restaurants')
      .select('id, name')
      .ilike('name', `%${lookupName}%`)
      .limit(1)
      .maybeSingle()

    if (nameError) throw new Error(`Restaurant not found: ${lookupName}`)
    if (restaurantRecord?.id) return restaurantRecord.id

    throw new Error('Could not resolve restaurant. Please select a valid restaurant.')
  }

  const validateAddress = (): boolean => {
    if (!deliveryAddress.streetAddress.trim()) {
      setError('Please enter a street address')
      return false
    }
    if (!deliveryAddress.city.trim()) {
      setError('Please enter a city')
      return false
    }
    if (!deliveryAddress.postalCode.trim()) {
      setError('Please enter a postal code')
      return false
    }
    if (!deliveryAddress.phoneNumber.trim()) {
      setError('Please enter a phone number')
      return false
    }
    const phoneRegex = /^[\+]?[0-9]{10,13}$/
    if (!phoneRegex.test(deliveryAddress.phoneNumber.replace(/\s/g, ''))) {
      setError('Please enter a valid phone number (e.g., +254712345678 or 0712345678)')
      return false
    }
    return true
  }

  const ensureUserExists = async (userId: string, email: string, name?: string): Promise<boolean> => {
    try {
      console.log('🔍 Ensuring user exists:', { userId, email, name })

      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id, email, name')
        .eq('id', userId)
        .maybeSingle()

      if (checkError) {
        console.error('❌ Error checking user existence:', checkError)
        return false
      }

      if (existingUser) {
        console.log('✅ User already exists in public.users:', existingUser)
        return true
      }

      console.log('📝 User not found in public.users, attempting to create...')

      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

      if (authError) {
        console.error('❌ Error getting auth user:', authError)
        return false
      }

      const finalName = name ||
        authUser?.user_metadata?.name ||
        authUser?.user_metadata?.full_name ||
        email.split('@')[0] ||
        'User'

      // FIX: Added role: 'customer' — required field that was missing
      const { data: insertedUser, error: insertError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: email,
          name: finalName,
          role: 'customer',
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (insertError) {
        console.error('❌ Failed to create user in public.users:', insertError)
        console.error('❌ Error details:', insertError.message, 'Code:', insertError.code)

        if (insertError.code === '23505') {
          console.log('🔄 User was created by another process, checking again...')
          await new Promise(resolve => setTimeout(resolve, 500))

          const { data: retryUser } = await supabase
            .from('users')
            .select('id')
            .eq('id', userId)
            .maybeSingle()

          if (retryUser) {
            console.log('✅ User found on retry')
            return true
          }
        }

        return false
      }

      console.log('✅ User successfully created in public.users:', insertedUser)
      return true

    } catch (err) {
      console.error('❌ Unexpected error in ensureUserExists:', err)
      return false
    }
  }

  const handlePlaceOrder = async () => {
    setError('')

    if (!session?.user?.id) {
      setError('Please login to place an order.')
      setTimeout(() => router.push('/auth/login'), 2000)
      return
    }

    const userId = session.user.id
    if (!isValidUuid(userId)) {
      setError('Invalid user ID. Please log out and log in again.')
      return
    }

    const userEmail = session.user.email || ''
    const userName = session.user.user_metadata?.name ||
      session.user.user_metadata?.full_name ||
      userEmail.split('@')[0]

    console.log('📦 Placing order for user:', { userId, userEmail, userName })

    let userExists = false
    let retryCount = 0
    const maxRetries = 3

    while (!userExists && retryCount < maxRetries) {
      userExists = await ensureUserExists(userId, userEmail, userName)
      if (!userExists) {
        retryCount++
        console.log(`⚠️ User creation attempt ${retryCount} failed, retrying...`)
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
    }

    if (!userExists) {
      console.error('❌ Failed to ensure user exists after multiple attempts')
      setError('Account setup error. Please try logging out and back in.')
      return
    }

    if (items.length === 0) {
      setError('Your cart is empty. Add items before checking out.')
      return
    }

    if (!validateAddress()) return

    setLoading(true)

    try {
      const rawRestaurantId = items[0].restaurantId
      if (!rawRestaurantId) throw new Error('Restaurant information is missing.')

      const restaurantId = await resolveRestaurantId(rawRestaurantId)
      console.log('🏪 Restaurant resolved:', restaurantId)

      const fullAddress = `${deliveryAddress.streetAddress}, ${deliveryAddress.city}, ${deliveryAddress.postalCode}`

      // FIX: Added total_price (required NOT NULL) and phone_number to order
      const newOrder: Order = {
        user_id: userId,
        restaurant_id: restaurantId,
        status: 'awaiting_payment',
        total_amount: total,
        total_price: total / 100,   // total_price is NUMERIC(10,2) — convert from cents
        delivery_address: fullAddress,
        phone_number: deliveryAddress.phoneNumber,
        created_at: new Date().toISOString()
      }

      console.log('📝 Creating order with data:', newOrder)

      const { data: insertedOrders, error: orderError } = await supabase
        .from('orders')
        .insert([newOrder])
        .select()
        .single()

      if (orderError) {
        console.error('❌ Order insert error:', orderError)
        if (orderError.code === '23503') {
          setError('Invalid restaurant or user reference. Please try again.')
        } else if (orderError.code === '23505') {
          setError('An order with these details already exists.')
        } else {
          setError(`Failed to create order: ${orderError.message}`)
        }
        return
      }

      if (!insertedOrders?.id) throw new Error('Order created but no ID returned')

      console.log('✅ Order created with ID:', insertedOrders.id)

      // FIX: Added name and restaurant_name fields that now exist in order_items table
      const orderItems = await Promise.all(items.map(async (item: CartItem) => {
        let realMenuItemId = isValidUuid(item.id) ? item.id : null;
        
        if (!realMenuItemId) {
          try {
            const { data } = await supabase
              .from('menu_items')
              .select('id')
              .ilike('name', item.name)
              .limit(1)
              .maybeSingle();
              
            if (data?.id) {
              realMenuItemId = data.id;
            }
          } catch (e) {
            console.error('Error resolving menu item ID:', e);
          }
        }

        return {
          order_id: insertedOrders.id,
          menu_item_id: realMenuItemId,
          quantity: item.quantity,
          price: item.price / 100,    // price is NUMERIC(10,2) or similar — convert from cents
          name: item.name,
          restaurant_name: item.restaurantName
        };
      }));

      console.log('📝 Inserting order items:', orderItems)

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        console.error('❌ Order items error:', itemsError)
        // FIX: Show actual error instead of generic message
        setError(`Items failed to save: ${itemsError.message} (code: ${itemsError.code})`)
        return
      }

      console.log('✅ Order items saved successfully')

      clearCart()
      router.push(`/payment/${insertedOrders.id}`)

    } catch (err) {
      console.error('❌ Checkout error:', err)
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const debugUserSetup = async () => {
      if (!session?.user?.id) return

      console.log('=== 🔍 DEBUG USER SETUP ===')
      console.log('Session user ID:', session.user.id)
      console.log('Session email:', session.user.email)

      const { data: publicUser, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle()

      if (error) {
        console.error('Error checking public.users:', error)
      } else if (publicUser) {
        console.log('✅ User exists in public.users:', publicUser)
      } else {
        console.log('❌ User NOT in public.users - will be created on order')
      }

      console.log('=== END DEBUG ===')
    }

    debugUserSetup()
  }, [session])

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-gray-800 font-medium mb-6">Add items from restaurants before checking out.</p>
        <Link
          href="/restaurants"
          className="inline-block bg-[#d97c4a] text-white px-6 py-2 rounded-full hover:bg-[#c26b3a] transition-colors"
        >
          Browse Restaurants
        </Link>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <Loader2 className="animate-spin h-12 w-12 text-[#d97c4a] mx-auto" />
        <p className="mt-4 text-gray-800 font-medium">Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-2">Checkout</h1>
      <p className="text-gray-800 font-medium mb-6">Review your order and enter delivery details.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6 border border-[#ece7e1] shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3">
              {items.map((item: CartItem, idx: number) => (
                <div key={`${item.id}-${idx}`} className="flex justify-between py-2 border-b border-[#ece7e1] last:border-b-0">
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-700 font-medium">{item.restaurantName} × {item.quantity}</div>
                  </div>
                  <div className="font-semibold">KES {((item.price * item.quantity) / 100).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-[#ece7e1] shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={20} className="text-[#d97c4a]" />
              <h2 className="text-lg font-semibold">Delivery Address</h2>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-start gap-2">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Street Address *</label>
                <input
                  type="text"
                  name="streetAddress"
                  value={deliveryAddress.streetAddress}
                  onChange={handleAddressChange}
                  placeholder="e.g., 123 Main Street, Apt 4B"
                  className="w-full px-4 py-2 border border-[#e7e1da] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d97c4a] focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={deliveryAddress.city}
                    onChange={handleAddressChange}
                    placeholder="e.g., Nairobi"
                    className="w-full px-4 py-2 border border-[#e7e1da] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d97c4a] focus:border-transparent"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Postal Code *</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={deliveryAddress.postalCode}
                    onChange={handleAddressChange}
                    placeholder="e.g., 00100"
                    className="w-full px-4 py-2 border border-[#e7e1da] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d97c4a] focus:border-transparent"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={deliveryAddress.phoneNumber}
                  onChange={handleAddressChange}
                  placeholder="e.g., +254712345678 or 0712345678"
                  className="w-full px-4 py-2 border border-[#e7e1da] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d97c4a] focus:border-transparent"
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 border border-[#ece7e1] shadow-sm sticky top-20">
            <h3 className="text-lg font-semibold mb-4">Order Total</h3>

            <div className="space-y-2 text-sm text-gray-800 font-medium mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>KES {(subtotal / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>KES {(deliveryFee / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-[#1a1a1a] text-base border-t border-[#ece7e1] pt-2 mt-2">
                <span>Total</span>
                <span>KES {(total / 100).toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full bg-[#d97c4a] text-white px-6 py-3 rounded-full hover:bg-[#c26b3a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  Placing Order...
                </>
              ) : (
                'Place Order'
              )}
            </button>

            <Link
              href="/cart"
              className="block text-center mt-3 text-gray-800 font-medium hover:text-[#1a1a1a] text-sm transition-colors"
            >
              ← Back to Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}