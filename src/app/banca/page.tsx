"use client"

import React, { useEffect, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

export default function BancaPage() {
  const { language } = useLanguage()
  const { toast } = useToast()
  const [projetos, setProjetos] = useState<any[]>([])
  const [user, setUser] = useState<any | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      // load current user to determine role and permissions
      try {
        const me = await fetch('/api/auth/me')
        const mePayload = await me.json()
        if (mounted && me.ok && mePayload.ok) setUser(mePayload.user)
      } catch (e) {
        // ignore
      }
      try {
        const q = filterStatus && filterStatus !== 'all' ? `/api/me/projetos?status=${encodeURIComponent(filterStatus)}` : '/api/me/projetos'
        const res = await fetch(q, { credentials: 'same-origin' })
        const payload = await res.json()
        if (!mounted) return
        if (!res.ok || !payload.ok) {
          toast({ title: language === 'pt' ? 'Erro' : 'Error', description: payload.error || 'Failed to load' })
          setProjetos([])
        } else {
          setProjetos(payload.projetos || [])
        }
      } catch (err: any) {
        toast({ title: language === 'pt' ? 'Erro' : 'Error', description: err?.message ?? String(err) })
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [language, toast, filterStatus])

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{language === 'pt' ? 'Projetos' : 'Projects'}</h1>
          <button onClick={() => router.push('/')} className="text-sm text-blue-600">{language === 'pt' ? 'Voltar' : 'Back'}</button>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <label className="text-sm text-gray-700">{language === 'pt' ? 'Estado' : 'Status'}</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border rounded">
              <option value="all">{language === 'pt' ? 'Todos' : 'All'}</option>
              <option value="pendente">{language === 'pt' ? 'Pendente' : 'Pending'}</option>
              <option value="em_analise">{language === 'pt' ? 'Em Análise' : 'In Analysis'}</option>
              <option value="finalizado">{language === 'pt' ? 'Finalizado' : 'Finished'}</option>
            </select>
          </div>
          <div className="text-sm text-gray-700">
            {projetos.length} {language === 'pt' ? 'projetos' : 'projects'}
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-600">{language === 'pt' ? 'A carregar...' : 'Loading...'}</div>
        ) : projetos.length === 0 ? (
          <div className="text-center text-gray-600">{language === 'pt' ? 'Nenhum projeto encontrado.' : 'No projects found.'}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projetos.filter((p) => {
              if (!filterStatus || filterStatus === 'all') return true
              return String(p.status || '').toLowerCase() === String(filterStatus).toLowerCase()
            }).map((p) => (
              <article key={p.id} className="bg-white border rounded-lg p-4 shadow-sm">
                <header className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{p.full_name || p.email}</h3>
                    <p className="text-sm text-gray-600">{p.service} • {p.location}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' : p.status === 'em_analise' ? 'bg-blue-100 text-blue-800' : p.status === 'finalizado' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {p.status === 'pendente' ? (language === 'pt' ? 'Pendente' : 'Pending') : p.status === 'em_analise' ? (language === 'pt' ? 'Em Análise' : 'In Analysis') : p.status === 'finalizado' ? (language === 'pt' ? 'Finalizado' : 'Finished') : (language === 'pt' ? 'Respondido' : 'Responded')}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">{new Date(p.created_at).toLocaleString()}</div>
                  </div>
                </header>
                <p className="mt-3 text-sm text-gray-700 line-clamp-4">{p.description}</p>
                <footer className="mt-4 flex items-center justify-between text-sm text-gray-600">
                  <div>{/* show contacts only to admins */}
                    {/** @ts-ignore */}
                    {typeof window !== 'undefined' && /* client runtime check */ null}
                    {/** We'll rely on the server endpoint: admin results include contact; client results include only their projects, so hide contact here */}
                    {p.email && p.phone ? <span className="hidden">{p.email} • {p.phone}</span> : null}
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="font-medium">{p.budget ? `€ ${p.budget}` : ''}</div>
                    {/* allow clients to edit their own projects */}
                    {user && ['cliente', 'franqueado', 'franqueador'].includes(String((user.role || '')).toLowerCase()) && String(user.email || '').toLowerCase() === String(p.email || '').toLowerCase() && (
                      <button onClick={() => router.push(`/projetos/${p.id}/edit`)} className="text-sm text-blue-600 hover:underline">Editar</button>
                    )}
                  </div>
                </footer>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
