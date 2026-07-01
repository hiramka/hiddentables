'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Phone, MapPin, Send } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In production, send to your API
    console.log('Form submitted:', formData)
    setSubmitted(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-white rounded-xl p-8 border border-[#ece7e1]">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send size={24} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Message Sent!</h2>
          <p className="text-[#5f5b56] mb-6">
            Thank you for contacting us. We'll get back to you within 24 hours.
          </p>
          <Link
            href="/"
            className="inline-block bg-[#d97c4a] text-white px-6 py-2 rounded-full hover:bg-[#c26b3a]"
          >
            Return Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Contact Us</h1>
      <p className="text-[#5f5b56] mb-8">We'd love to hear from you</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white rounded-xl p-4 border border-[#ece7e1]">
            <Phone size={20} className="text-[#d97c4a] mb-2" />
            <h3 className="font-medium mb-1">Phone</h3>
            <p className="text-sm text-[#5f5b56]">+254 712 345 678</p>
            <p className="text-xs text-[#5f5b56]">Mon-Fri, 8am-8pm</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-[#ece7e1]">
            <Mail size={20} className="text-[#d97c4a] mb-2" />
            <h3 className="font-medium mb-1">Email</h3>
            <p className="text-sm text-[#5f5b56]">support@hiddentables.com</p>
            <p className="text-xs text-[#5f5b56]">24/7 response within 24h</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-[#ece7e1]">
            <MapPin size={20} className="text-[#d97c4a] mb-2" />
            <h3 className="font-medium mb-1">Office</h3>
            <p className="text-sm text-[#5f5b56]">123 Kenyatta Ave</p>
            <p className="text-sm text-[#5f5b56]">Nairobi, Kenya</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 border border-[#ece7e1]">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#5f5b56] mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-[#e7e1da] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d97c4a]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5f5b56] mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-[#e7e1da] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d97c4a]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5f5b56] mb-1">
                  Subject
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-[#e7e1da] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d97c4a]"
                >
                  <option value="">Select a subject</option>
                  <option value="order">Order Issue</option>
                  <option value="restaurant">Restaurant Inquiry</option>
                  <option value="payment">Payment Problem</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5f5b56] mb-1">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-2 border border-[#e7e1da] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d97c4a]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#d97c4a] text-white py-3 rounded-full hover:bg-[#c26b3a] transition-colors flex items-center justify-center gap-2"
              >
                <Send size={16} />
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}