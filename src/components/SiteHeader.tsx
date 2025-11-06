"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Globe, Menu, X } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'

export default function SiteHeader() {
  const { language, toggleLanguage } = useLanguage()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    let mounted = true
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!mounted) return
      if (d?.ok && d.user) setCurrentUser(d.user)
    }).catch(()=>{})
    return () => { mounted = false }
  }, [])

  const t = {
    pt: { nav: { home: 'Início', quote: 'Pedir Orçamento', franchise: 'Franquia', dashboard: 'Dashboard', chat: 'Rede Franquiados' } },
    en: { nav: { home: 'Home', quote: 'Request Quote', franchise: 'Franchise', dashboard: 'Dashboard', chat: 'Franchise Network' } }
  }

  const currentLang = t[language]

  return (
    <nav className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-2xl font-bold text-gray-900">AFIX</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {Object.entries(currentLang.nav).map(([key, label]) => (
              <button key={key} onClick={() => router.push('/') } className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600">{label}</button>
            ))}

            <button onClick={toggleLanguage} className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600">
              <Globe className="h-4 w-4 mr-1" /> {language.toUpperCase()}
            </button>

            {currentUser ? (
              <button onClick={async () => { try { await fetch('/api/auth/logout', { method: 'POST' }) } catch(e){}; setCurrentUser(null); router.push('/') }} className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600">Logout</button>
            ) : (
              <button onClick={() => router.push('/login')} className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600">Login</button>
            )}
          </div>

          <div className="md:hidden">
            <button onClick={() => setMobileOpen(!mobileOpen)} className="text-gray-700 hover:text-blue-600">{mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}</button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {Object.entries(currentLang.nav).map(([key, label]) => (
              <button key={key} onClick={() => { setMobileOpen(false); router.push('/') }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600">{label}</button>
            ))}
            <button onClick={() => toggleLanguage()} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600">{language.toUpperCase()}</button>
            <div className="px-3 py-2">
              {currentUser ? (
                <button onClick={async () => { try { await fetch('/api/auth/logout', { method: 'POST' }) } catch(e){}; setMobileOpen(false); router.push('/') }} className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600">Logout</button>
              ) : (
                <button onClick={() => { setMobileOpen(false); router.push('/login') }} className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600">Login</button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
