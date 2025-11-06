"use client"

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

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
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [projeto, setProjeto] = useState<any>(null)
  const [form, setForm] = useState({ service: '', description: '', location: '', urgency: '', budget: '' })

  useEffect(() => {
    if (!id) return
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch(`/api/projetos/${id}`)
        const payload = await res.json()
        if (!mounted) return
        if (!res.ok || !payload.ok) {
          toast({ title: 'Erro', description: payload.error || 'Failed to load' })
        } else {
          setProjeto(payload.projeto)
          setForm({
            service: payload.projeto.service || '',
            description: payload.projeto.description || '',
            location: payload.projeto.location || '',
            urgency: payload.projeto.urgency || '',
            budget: payload.projeto.budget || ''
          })
        }
      } catch (e: any) {
        toast({ title: 'Erro', description: e?.message ?? String(e) })
      } finally {
        if (mounted) setLoading(false)
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
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Editar Projeto</h2>
        {loading ? (
          <div>Carregando...</div>
        ) : !projeto ? (
          <div>Projeto não encontrado</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
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
            <div className="flex items-center space-x-3">
              <button type="submit" disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded">{saving ? 'A gravar...' : 'Guardar'}</button>
              <button type="button" onClick={() => router.push('/banca')} className="text-sm text-gray-600">Cancelar</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
