'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Send, MessageCircle, ArrowLeft } from 'lucide-react'
import { supabase } from '../../src/lib/supabaseClient'

interface ChatMessage {
  id: string
  user_id: string
  message: string
  is_support: boolean
  created_at: string
}

export default function ChatPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadSession() {
      const {
        data: { session }
      } = await supabase.auth.getSession()
      setSession(session)
      if (!session) {
        router.push('/auth/login')
        return
      }
      loadMessages()
    }
    loadSession()
  }, [router])

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error loading messages:', error)
    } else {
      setMessages(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!session) return

    // Subscribe to new messages
    const channel = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as ChatMessage])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !session) return

    const { error } = await supabase
      .from('chat_messages')
      .insert([
        {
          user_id: session.user.id,
          message: newMessage.trim(),
          is_support: false
        }
      ])

    if (error) {
      console.error('Error sending message:', error)
    } else {
      setNewMessage('')
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <p className="text-[#1a1a1a]">Loading chat...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-[#f0ebe6] rounded-full transition-colors"
        >
          <ArrowLeft size={20} className="text-[#1a1a1a]" />
        </button>
        <div className="flex items-center gap-2">
          <MessageCircle size={24} className="text-[#d97c4a]" />
          <h1 className="text-2xl font-bold">Live Chat Support</h1>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-xl border border-[#ece7e1] h-[600px] flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 p-4 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center text-[#5f5b56] py-8">
              <MessageCircle size={48} className="mx-auto mb-4 text-[#d97c4a] opacity-50" />
              <p>Start a conversation with our support team</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.is_support ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.is_support
                        ? 'bg-[#f0ebe6] text-[#1a1a1a]'
                        : 'bg-[#d97c4a] text-white'
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    <p className={`text-xs mt-1 ${
                      message.is_support ? 'text-[#5f5b56]' : 'text-orange-100'
                    }`}>
                      {new Date(message.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="border-t border-[#ece7e1] p-4">
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-[#e7e1da] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d97c4a]"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-[#d97c4a] text-white px-4 py-2 rounded-lg hover:bg-[#c26b3a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 text-center text-sm text-[#5f5b56]">
        <p>Our support team typically responds within 5 minutes during business hours.</p>
      </div>
    </div>
  )
}