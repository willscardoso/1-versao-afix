"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
// SiteHeader and SiteFooter are now provided globally by the root layout

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [roles, setRoles] = useState<Array<{ role_id: number; name: string }>>([])
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName, email, password, role })
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Erro ao registar utilizador')
      }

      toast({ title: 'Registo concluído', description: 'Conta criada. Faça login.' })
      router.push('/login')
    } catch (err: any) {
      setError(err?.message ?? 'Erro ao registar')
    } finally {
      setLoading(false)
    }
  }

  // load roles for dropdown
  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/auth/roles')
        const data = await res.json()
        if (!mounted) return
        if (res.ok && data.ok) {
          // remove 'admin' from dropdown list
          const filtered = (data.roles || []).filter((r: any) => String(r.name).toLowerCase() !== 'admin')
          setRoles(filtered)
          // prefer selecting 'cliente' if present
          const cliente = filtered.find((r: any) => String(r.name).toLowerCase() === 'cliente')
          if (cliente) setRole(String(cliente.name))
          else if (filtered.length > 0) setRole(String(filtered[0].name))
        }
      } catch (e) {
        // ignore
      }
    })()
    return () => { mounted = false }
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <main className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-lg overflow-hidden shadow-lg md:h-[600px]">
            {/* Left welcome panel */}
            <div className="hidden md:flex items-center justify-center bg-blue-600 p-10 h-full">
              <div className="text-center text-white max-w-md">
                <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
                <p className="mb-6">To keep connected with us please login with your personal info</p>
                <button onClick={() => router.push('/login')} className="inline-block px-6 py-3 border border-white rounded-full hover:bg-white hover:text-blue-600 transition">
                  Entrar
                </button>
              </div>
            </div>

            {/* Right form panel */}
            <div className="p-8 bg-white flex items-center justify-center h-full overflow-y-auto">
              <div className="w-full max-w-md">
                <h2 className="text-2xl font-semibold mb-4">Create Account</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                    <input
                      id="fullName"
                      type="text"
                      required
                      placeholder="Nome"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Role dropdown */}
                  {roles.length > 0 && (
                    <div>
                      <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Tipo de utilizador</label>
                      <select id="role" value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500">
                        {roles.map((r) => (
                          <option key={r.role_id} value={r.name}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                  )}


                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                    <input
                      id="password"
                      type="password"
                      required
                      placeholder="Senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {error && <div className="text-sm text-red-600">{error}</div>}

                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-600 text-white py-3 rounded-full hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? 'A processar...' : 'Registar'}
                    </button>
                  </div>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                  <button onClick={() => router.push('/login')} className="text-blue-600 hover:underline">Já tem uma conta? Entrar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
