'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User as UserIcon, Store } from 'lucide-react'
import { supabase } from '../../../src/lib/supabaseClient'

export default function LoginPage() {
  const router = useRouter()
  const [userType, setUserType] = useState('customer')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Redirect based on user type (you might want to store this in user metadata)
      if (userType === 'customer') {
        router.push('/')
      } else if (userType === 'restaurant') {
        router.push('/dashboard/restaurant')
      } else {
        router.push('/dashboard/admin')
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
            <p className="text-[#5f5b56]">Sign in to continue your culinary journey</p>
          </div>

          {/* User Type Selector */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setUserType('customer')}
              className={`flex-1 py-3 rounded-full flex items-center justify-center gap-2 transition-colors
                ${userType === 'customer' 
                  ? 'bg-[#d97c4a] text-white' 
                  : 'bg-[#f0ebe6] text-[#1a1a1a] hover:bg-[#ece7e1]'}`}
            >
              <UserIcon size={18} />
              Customer
            </button>
            <button
              onClick={() => setUserType('restaurant')}
              className={`flex-1 py-3 rounded-full flex items-center justify-center gap-2 transition-colors
                ${userType === 'restaurant' 
                  ? 'bg-[#d97c4a] text-white' 
                  : 'bg-[#f0ebe6] text-[#1a1a1a] hover:bg-[#ece7e1]'}`}
            >
              <Store size={18} />
              Restaurant
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#5f5b56] mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5f5b56]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-[#e7e1da] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d97c4a]"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#5f5b56] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5f5b56]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-[#e7e1da] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d97c4a]"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#e7e1da] text-[#d97c4a] focus:ring-[#d97c4a]"
                />
                <span className="ml-2 text-sm text-[#5f5b56]">Remember me</span>
              </label>
              <Link href="/auth/forgot-password" className="text-sm text-[#d97c4a] hover:underline">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#d97c4a] text-white py-3 rounded-full hover:bg-[#c26b3a] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e7e1da]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-[#5f5b56]">Or continue with</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 border border-[#e7e1da] py-2 rounded-full hover:bg-[#f0ebe6] transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 border border-[#e7e1da] py-2 rounded-full hover:bg-[#f0ebe6] transition-colors">
              <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
          </div>

          {/* Register Link */}
          <p className="text-center text-sm text-[#5f5b56] mt-6">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-[#d97c4a] font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}