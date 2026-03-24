'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard, Images, BookOpen, Grid3X3, Gift,
  Camera, Calendar, Share2, FileText, Settings, LogOut
} from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/slideshow', label: 'Slideshow', icon: Images },
  { href: '/admin/speisekarte', label: 'Speisekarte', icon: BookOpen },
  { href: '/admin/carousel', label: 'Carousel Slider', icon: Grid3X3 },
  { href: '/admin/angebot', label: 'Angebot', icon: Gift },
  { href: '/admin/restaurant-bilder', label: 'Restaurant Bilder', icon: Camera },
  { href: '/admin/reservierungen', label: 'Reservierungen', icon: Calendar },
  { href: '/admin/social-media', label: 'Social Media', icon: Share2 },
  { href: '/admin/rechtliches', label: 'Rechtliches', icon: FileText },
  { href: '/admin/einstellungen', label: 'Einstellungen', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-lg font-bold text-red-400">Da Corrado</h1>
        <p className="text-xs text-gray-400 mt-1">Admin Panel</p>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                isActive
                  ? 'bg-red-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          Abmelden
        </button>
      </div>
    </aside>
  )
}
