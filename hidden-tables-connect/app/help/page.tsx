'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  HelpCircle, 
  MessageCircle, 
  Phone, 
  Mail,
  ChevronDown,
  ChevronUp,
  Search,
  ArrowLeft
} from 'lucide-react'

export default function HelpPage() {
  const router = useRouter()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const faqs = [
    {
      question: 'How do I place an order?',
      answer: 'Browse restaurants, select items you want, add them to cart, and proceed to checkout. You can pay via M-Pesa or card.'
    },
    {
      question: 'What are the delivery hours?',
      answer: 'Most restaurants deliver from 10:00 AM to 10:00 PM. Check individual restaurant pages for their specific hours.'
    },
    {
      question: 'How can I track my order?',
      answer: 'After placing an order, you can track it in real-time from the order tracking page. You\'ll also receive SMS updates.'
    },
    {
      question: 'What if my order is late?',
      answer: 'If your order is significantly delayed, please contact our support team. We\'ll investigate and compensate you if necessary.'
    },
    {
      question: 'Can I cancel my order?',
      answer: 'You can cancel within 2 minutes of placing the order. After that, please contact the restaurant directly.'
    },
    {
      question: 'How do I become a partner restaurant?',
      answer: 'Email us at partners@hiddentables.com with your restaurant details, and our team will reach out within 48 hours.'
    }
  ]

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back Button */}
      <button 
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-[#000000] hover:text-[#d97c4a] transition-colors mb-4"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Header */}
      <div className="text-center mb-8">
        <HelpCircle size={48} className="mx-auto text-[#d97c4a] mb-4" />
        <h1 className="text-2xl font-bold mb-2">How can we help you?</h1>
        <p className="text-[#000000]">Find answers to common questions below</p>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#000000]" />
        <input
          type="text"
          placeholder="Search for help..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-full border border-[#e7e1da] bg-white focus:outline-none focus:ring-2 focus:ring-[#d97c4a]"
        />
      </div>

      {/* Contact Options */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <a 
          href="tel:+254712345678" 
          className="bg-white rounded-xl p-4 border border-[#ece7e1] text-center hover:border-[#dbbca7] hover:shadow-md transition-all"
        >
          <Phone size={24} className="mx-auto text-[#d97c4a] mb-2" />
          <h3 className="font-medium">Call Us</h3>
          <p className="text-xs text-[#000000] mt-1">+254 712 345 678</p>
          <p className="text-xs text-[#d97c4a] mt-2">24/7 Support</p>
        </a>
        
        <a 
          href="mailto:support@hiddentables.com" 
          className="bg-white rounded-xl p-4 border border-[#ece7e1] text-center hover:border-[#dbbca7] hover:shadow-md transition-all"
        >
          <Mail size={24} className="mx-auto text-[#d97c4a] mb-2" />
          <h3 className="font-medium">Email</h3>
          <p className="text-xs text-[#000000] mt-1">support@hiddentables.com</p>
          <p className="text-xs text-[#d97c4a] mt-2">Reply within 2 hours</p>
        </a>
        
        <Link 
          href="/chat" 
          className="bg-white rounded-xl p-4 border border-[#ece7e1] text-center hover:border-[#dbbca7] hover:shadow-md transition-all"
        >
          <MessageCircle size={24} className="mx-auto text-[#d97c4a] mb-2" />
          <h3 className="font-medium">Live Chat</h3>
          <p className="text-xs text-[#000000] mt-1">Chat with our team</p>
          <p className="text-xs text-[#d97c4a] mt-2">Available 24/7</p>
        </Link>
      </div>

      {/* Quick Links */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        <Link 
          href="/orders" 
          className="text-xs bg-[#f0ebe6] text-[#1a1a1a] px-3 py-1 rounded-full hover:bg-[#ece7e1] transition-colors"
        >
          Track Order
        </Link>
        <Link 
          href="/restaurants" 
          className="text-xs bg-[#f0ebe6] text-[#1a1a1a] px-3 py-1 rounded-full hover:bg-[#ece7e1] transition-colors"
        >
          Browse Restaurants
        </Link>
        <Link 
          href="/auth/register" 
          className="text-xs bg-[#f0ebe6] text-[#1a1a1a] px-3 py-1 rounded-full hover:bg-[#ece7e1] transition-colors"
        >
          Partner Registration
        </Link>
      </div>

      {/* FAQs */}
      <div className="bg-white rounded-xl border border-[#ece7e1] p-6">
        <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
        
        <div className="space-y-3">
          {filteredFaqs.map((faq, index) => (
            <div key={index} className="border border-[#ece7e1] rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full flex justify-between items-center p-4 text-left hover:bg-[#fcfaf7] transition-colors"
              >
                <span className="font-medium">{faq.question}</span>
                {openFaq === index ? (
                  <ChevronUp size={16} className="text-[#d97c4a]" />
                ) : (
                  <ChevronDown size={16} className="text-[#000000]" />
                )}
              </button>
              
              {openFaq === index && (
                <div className="p-4 pt-0 text-sm text-[#000000] border-t border-[#ece7e1]">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredFaqs.length === 0 && (
          <div className="text-center py-8">
            <p className="text-[#000000] mb-4">No matching questions found</p>
            <Link
              href="/contact"
              className="inline-block bg-[#d97c4a] text-white px-6 py-2 rounded-full hover:bg-[#c26b3a] transition-colors"
            >
              Contact Support
            </Link>
          </div>
        )}
      </div>

      {/* Still Need Help */}
      <div className="mt-8 text-center bg-[#fcfaf7] rounded-xl p-6 border border-[#ece7e1]">
        <p className="text-[#000000] mb-3">Still need help?</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/contact"
            className="bg-[#d97c4a] text-white px-6 py-2 rounded-full hover:bg-[#c26b3a] transition-colors"
          >
            Contact Support
          </Link>
          <Link
            href="/"
            className="bg-white border border-[#e7e1da] text-[#000000] px-6 py-2 rounded-full hover:bg-[#f0ebe6] transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  )
}