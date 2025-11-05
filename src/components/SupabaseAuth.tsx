"use client"

import React, { useState } from 'react'
import supabase from '@/lib/supabase'

export default function SupabaseAuth() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function signIn() {
    setLoading(true)
    setMessage(null)
    try {
      if (!supabase) {
        setMessage('Supabase não está configurado. Verifique as variáveis de ambiente.')
        return
      }
      const { error } = await supabase.auth.signInWithOtp({ email })
      if (error) throw error
      setMessage('Check your email for the sign-in link or code.')
    } catch (err: any) {
      setMessage(err.message ?? String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h3 className="text-lg font-medium mb-2">Entrar com e‑mail</h3>
      <input
        type="email"
        placeholder="seu@exemplo.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      <button
        onClick={signIn}
        disabled={loading || !email}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {loading ? 'A processar...' : 'Enviar link de entrada'}
      </button>

      {message && <p className="mt-3 text-sm">{message}</p>}
    </div>
  )
}
