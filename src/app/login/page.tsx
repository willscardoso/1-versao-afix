"use client"

import React from 'react'
import LoginForm from '@/components/LoginForm'
// SiteHeader and SiteFooter are now global in the root layout
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white">
      <main className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-lg overflow-hidden shadow-lg md:h-[600px]">
            {/* Left panel for sign-up prompt */}
            <div className="hidden md:flex items-center justify-center bg-blue-600 p-10 h-full">
              <div className="text-center text-white max-w-md">
                <h2 className="text-3xl font-bold mb-4">Create Account</h2>
                <p className="mb-6">or use your email for registration</p>
                <Link href="/register" className="inline-block px-6 py-3 border border-white rounded-full hover:bg-white hover:text-blue-600 transition">Registar</Link>
              </div>
            </div>

            {/* Right form panel */}
            <div className="p-8 bg-white flex items-center justify-center h-full overflow-y-auto">
              <div className="w-full max-w-md">
                {/* title removed per request */}

                <LoginForm />
                {/* Mobile-only register CTA (left panel is hidden on small screens) */}
                <div className="mt-4 text-center md:hidden">
                  <Link href="/register" className="inline-block px-4 py-2 border rounded-md text-sm font-medium text-blue-600 hover:bg-blue-50">Registar</Link>
                </div>

                <div className="mt-6 text-center text-sm text-gray-600">
                  <Link href="/" className="text-blue-600 hover:underline">Voltar ao início</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
