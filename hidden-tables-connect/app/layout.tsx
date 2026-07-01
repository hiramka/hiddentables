import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { Utensils, ShoppingCart, User, Store, Menu } from 'lucide-react'
import { CartProvider } from './context/CartContext'
import { CartBadge } from './components/CartBadge'
import { SearchBar } from './components/SearchBar'
import Script from 'next/script'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

const intercomAppId = process.env.NEXT_PUBLIC_INTERCOM_APP_ID || 'YOUR_INTERCOM_APP_ID'

export const metadata: Metadata = {
  title: 'Hidden Tables Connect',
  description: 'Discover hidden restaurants and unique menu items',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-foreground antialiased selection:bg-primary/30 selection:text-primaryDark`}>
        <CartProvider>
          <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#FAFAF8] to-[#F0EBE6]">
            {/* Header with Glassmorphism */}
            <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-lg border-b border-white/20 shadow-sm transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-20">
                {/* Logo */}
                <Link href="/" className="flex items-center space-x-3 group">
                  <div className="bg-gradient-to-tr from-[#FF5A3C] to-[#FFC857] p-2 rounded-xl shadow-lg group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300">
                    <Utensils className="h-6 w-6 text-white" />
                  </div>
                  <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 hidden sm:inline">
                    Hidden Tables
                  </span>
                </Link>

                {/* Search Bar */}
                <div className="hidden md:flex flex-1 max-w-md mx-8">
                  <SearchBar />
                </div>

                {/* Navigation */}
                <nav className="flex items-center space-x-2 sm:space-x-6">
                  <Link href="/restaurants" className="p-2.5 hover:bg-gray-100/80 rounded-full transition-all duration-200 hover:scale-110 text-gray-600 hover:text-gray-900">
                    <Store className="h-5 w-5" />
                  </Link>
                  <Link href="/cart" className="p-2.5 hover:bg-gray-100/80 rounded-full transition-all duration-200 hover:scale-110 text-gray-600 hover:text-gray-900 relative">
                    <ShoppingCart className="h-5 w-5" />
                    <CartBadge />
                  </Link>
                  <Link href="/profile" className="p-2.5 hover:bg-gray-100/80 rounded-full transition-all duration-200 hover:scale-110 text-gray-600 hover:text-gray-900">
                    <User className="h-5 w-5" />
                  </Link>
                  
                  {/* Mobile menu button */}
                  <button className="md:hidden p-2.5 hover:bg-gray-100/80 rounded-full transition-all duration-200 active:scale-95">
                    <Menu className="h-5 w-5 text-gray-800" />
                  </button>
                </nav>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-white/80 backdrop-blur-md border-t border-gray-200 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                  <h3 className="font-bold text-gray-900 mb-4 tracking-wide">Discover</h3>
                  <ul className="space-y-3">
                    <li><Link href="/restaurants" className="text-sm text-gray-600 hover:text-[#FF5A3C] transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-transparent hover:bg-[#FF5A3C]"></span>Restaurants</Link></li>
                    <li><Link href="/menu" className="text-sm text-gray-600 hover:text-[#FF5A3C] transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-transparent hover:bg-[#FF5A3C]"></span>Menu Items</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-4 tracking-wide">Your Account</h3>
                  <ul className="space-y-3">
                    <li><Link href="/profile" className="text-sm text-gray-600 hover:text-[#FF5A3C] transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-transparent hover:bg-[#FF5A3C]"></span>Profile</Link></li>
                    <li><Link href="/cart" className="text-sm text-gray-600 hover:text-[#FF5A3C] transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-transparent hover:bg-[#FF5A3C]"></span>Cart</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-4 tracking-wide">For Partners</h3>
                  <ul className="space-y-3">
                    <li><Link href="/auth/login" className="text-sm text-gray-600 hover:text-[#FF5A3C] transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-transparent hover:bg-[#FF5A3C]"></span>Partner Login</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-4 tracking-wide">Support</h3>
                  <ul className="space-y-3">
                    <li><Link href="/help" className="text-sm text-gray-600 hover:text-[#FF5A3C] transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-transparent hover:bg-[#FF5A3C]"></span>Help Center</Link></li>
                    <li><Link href="/chat" className="text-sm text-gray-600 hover:text-[#FF5A3C] transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-transparent hover:bg-[#FF5A3C]"></span>Live Chat</Link></li>
                  </ul>
                </div>
              </div>
              <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-sm text-gray-500">© {new Date().getFullYear()} Hidden Tables Connect. All rights reserved.</p>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-[#FF5A3C] hover:text-white transition-colors cursor-pointer"><Utensils size={14}/></div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </CartProvider>

      {/* Intercom Live Chat Widget */}
      <Script
        id="intercom-widget"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              var appId = "${intercomAppId}";
              if (!appId || appId === "YOUR_INTERCOM_APP_ID") {
                console.log("Intercom is disabled: App ID is not set or is still the placeholder.");
                return;
              }
              window.intercomSettings = {
                api_base: "https://widget.intercom.io",
                app_id: appId
              };
              var w = window;
              var ic = w.Intercom;
              if (typeof ic === "function") {
                ic('reattach_activator');
                ic('update', w.intercomSettings);
              } else {
                var d = document;
                var i = function() { i.c(arguments); };
                i.q = [];
                i.c = function(args) { i.q.push(args); };
                w.Intercom = i;
                var l = function() {
                  var s = d.createElement('script');
                  s.type = 'text/javascript';
                  s.async = true;
                  s.src = 'https://widget.intercom.io/widget/' + appId;
                  var x = d.getElementsByTagName('script')[0];
                  x.parentNode.insertBefore(s, x);
                };
                if (document.readyState === 'complete') {
                  l();
                } else if (w.attachEvent) {
                  w.attachEvent('onload', l);
                } else {
                  w.addEventListener('load', l, false);
                }
              }
            })();
          `,
        }}
      />
    </body>
    </html>
  )
}