"use client"

import React from 'react'
import LoginForm from '@/components/LoginForm'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Entrar na sua conta</h1>
          <p className="text-sm text-gray-600">Use o seu email e password para entrar</p>
        </div>

        <LoginForm />

        <div className="mt-6 text-center text-sm text-gray-600">
          <Link href="/" className="text-blue-600 hover:underline">Voltar ao início</Link>
        </div>
      </div>
    </div>
  )
}
