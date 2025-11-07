"use client"

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
// SiteHeader and SiteFooter are provided globally by the root layout

export default function EditProjetoPage() {
  const router = useRouter()
  const params = useSearchParams()
  // When mounted under /projetos/[id]/edit the id is part of the pathname, not search params.
  let id = params?.get('id') || ''
  if (!id && typeof window !== 'undefined') {
    const parts = window.location.pathname.split('/').filter(Boolean)
    // expected: ['projetos', '{id}', 'edit']
    if (parts.length >= 2) id = parts[1]
  }
  const { toast } = useToast()
  // Try to synchronously read cached projeto so first render can show the form immediately.
  // Prefer in-memory cache (fast) then fall back to sessionStorage.
  let cachedProjeto: any = null
  try {
    if (typeof window !== 'undefined') {
      try {
        const { takeEditingProjeto, peekEditingProjeto } = require('@/lib/editCache')
        // takeEditingProjeto returns and clears the in-memory cache if id matches
        cachedProjeto = takeEditingProjeto(id) || peekEditingProjeto()
      } catch (e) {
        // ignore module require issues (fallback to sessionStorage)
      }

      if (!cachedProjeto) {
        const raw = sessionStorage.getItem('afix_edit_projeto')
        if (raw) {
          const p = JSON.parse(raw)
          if (p && String(p.id) === String(id)) cachedProjeto = p
        }
      }
    }
  } catch (e) {
    // ignore
  }

  const [loading, setLoading] = useState<boolean>(cachedProjeto ? false : true)
  const [saving, setSaving] = useState(false)
  const [projeto, setProjeto] = useState<any>(cachedProjeto)
  const [form, setForm] = useState(() => ({ full_name: cachedProjeto?.full_name || '', email: cachedProjeto?.email || '', phone: cachedProjeto?.phone || '', service: cachedProjeto?.service || '', description: cachedProjeto?.description || '', location: cachedProjeto?.location || '', urgency: cachedProjeto?.urgency || '', budget: cachedProjeto?.budget || '', status: cachedProjeto?.status || '' }))

  useEffect(() => {
    if (!id) return
    let mounted = true

    ;(async () => {
      try {
        // Fetch fresh copy in background; don't force the loading indicator if we already had cached data
        const res = await fetch(`/api/projetos/${id}`, { credentials: 'same-origin' })
        const payload = await res.json()
        if (!mounted) return
        if (!res.ok || !payload.ok) {
          // if we had no cached data and fetch failed, notify
          if (!projeto) toast({ title: 'Erro', description: payload.error || 'Failed to load' })
        } else {
          setProjeto(payload.projeto)
          setForm({
            full_name: payload.projeto.full_name || '',
            email: payload.projeto.email || '',
            phone: payload.projeto.phone || '',
            service: payload.projeto.service || '',
            description: payload.projeto.description || '',
            location: payload.projeto.location || '',
            urgency: payload.projeto.urgency || '',
            budget: payload.projeto.budget || '',
            status: payload.projeto.status || ''
          })
        }
      } catch (e: any) {
        if (!projeto) toast({ title: 'Erro', description: e?.message ?? String(e) })
      } finally {
        if (mounted) setLoading(false)
        try { sessionStorage.removeItem('afix_edit_projeto') } catch (e) { /* ignore */ }
      }
    })()
    return () => { mounted = false }
  }, [id, toast])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!id) return
    setSaving(true)
    try {
      const res = await fetch(`/api/me/projetos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const payload = await res.json()
      if (!res.ok || !payload.ok) throw new Error(payload.error || 'Failed')
      toast({ title: 'Guardado', description: 'Projeto atualizado' })
      router.push('/banca')
    } catch (e: any) {
      toast({ title: 'Erro', description: e?.message ?? String(e) })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="py-8">
        <div className="max-w-3xl mx-auto p-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Editar Projeto</h2>
        {loading ? (
          <div>Carregando...</div>
        ) : !projeto ? (
          <div>Projeto não encontrado</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input value={form.full_name} onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))} className="w-full border px-3 py-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} className="w-full border px-3 py-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full border px-3 py-2 rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Serviço</label>
              <input value={form.service} onChange={(e) => setForm(f => ({ ...f, service: e.target.value }))} className="w-full border px-3 py-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
              <input value={form.location} onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))} className="w-full border px-3 py-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Urgência</label>
              <input value={form.urgency} onChange={(e) => setForm(f => ({ ...f, urgency: e.target.value }))} className="w-full border px-3 py-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Orçamento</label>
              <input value={form.budget} onChange={(e) => setForm(f => ({ ...f, budget: e.target.value }))} className="w-full border px-3 py-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} className="w-full border px-3 py-2 rounded h-28" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))} className="w-full border px-3 py-2 rounded">
                <option value="">-- selecione --</option>
                <option value="pendente">pendente</option>
                <option value="em_analise">em_analise</option>
                <option value="respondido">respondido</option>
                <option value="finalizado">finalizado</option>
              </select>
            </div>
            <div className="flex items-center space-x-3">
              <button type="submit" disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded">{saving ? 'A gravar...' : 'Guardar'}</button>
              <button type="button" onClick={() => router.push('/banca')} className="text-sm text-gray-600">Cancelar</button>
            </div>
          </form>
        )}
          </div>
        </div>
      </main>
    </div>
  )
}
