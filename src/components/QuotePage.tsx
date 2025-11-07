"use client"

import React, { useRef, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useLanguage } from '@/hooks/useLanguage'
import { SERVICES, URGENCY_LEVELS, BUDGET_RANGES } from '@/lib/constants'

export default function QuotePageComponent() {
  const { language } = useLanguage()
  const { toast } = useToast()
  const nameRef = useRef<HTMLInputElement | null>(null)
  const emailRef = useRef<HTMLInputElement | null>(null)
  const phoneRef = useRef<HTMLInputElement | null>(null)
  const serviceRef = useRef<HTMLSelectElement | null>(null)
  const locationRef = useRef<HTMLInputElement | null>(null)
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null)
  const urgencyRef = useRef<HTMLSelectElement | null>(null)
  const budgetRef = useRef<HTMLSelectElement | null>(null)

  const [quoteForm, setQuoteForm] = useState({ name: '', email: '', phone: '', service: '', description: '', location: '', urgency: 'media', budget: '' })

  async function handleQuoteSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const payload = {
        name: nameRef.current?.value || '',
        email: emailRef.current?.value || '',
        phone: phoneRef.current?.value || '',
        service: serviceRef.current?.value || '',
        description: descriptionRef.current?.value || '',
        location: locationRef.current?.value || '',
        urgency: urgencyRef.current?.value || 'media',
        budget: budgetRef.current?.value || ''
      }

      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to submit')
      toast({ title: language === 'pt' ? 'Orçamento enviado' : 'Quote sent', description: language === 'pt' ? 'O seu pedido foi recebido.' : 'Your request has been received.' })
      if (nameRef.current) nameRef.current.value = ''
      if (emailRef.current) emailRef.current.value = ''
      if (phoneRef.current) phoneRef.current.value = ''
      if (serviceRef.current) serviceRef.current.value = ''
      if (descriptionRef.current) descriptionRef.current.value = ''
      if (locationRef.current) locationRef.current.value = ''
      if (urgencyRef.current) urgencyRef.current.value = 'media'
      if (budgetRef.current) budgetRef.current.value = ''
      setQuoteForm({ name: '', email: '', phone: '', service: '', description: '', location: '', urgency: 'media', budget: '' })
    } catch (err: any) {
      toast({ title: language === 'pt' ? 'Erro' : 'Error', description: err?.message ?? 'Erro ao enviar pedido' })
    }
  }

  const t = {
    pt: {
      quote: {
        title: 'Solicitar Orçamento',
        subtitle: 'Preencha o formulário e receba propostas dos melhores profissionais',
        form: { name: 'Nome completo', email: 'Email', phone: 'Telefone', service: 'Tipo de serviço', description: 'Descrição do projeto', location: 'Localização', urgency: 'Urgência', budget: 'Orçamento estimado', submit: 'Enviar Pedido' }
      }
    },
    en: {
      quote: {
        title: 'Request Quote',
        subtitle: 'Fill out the form and receive proposals from the best professionals',
        form: { name: 'Full name', email: 'Email', phone: 'Phone', service: 'Service type', description: 'Project description', location: 'Location', urgency: 'Urgency', budget: 'Estimated budget', submit: 'Send Request' }
      }
    }
  }

  const currentLang = t[language]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{currentLang.quote.title}</h1>
          <p className="text-xl text-gray-600">{currentLang.quote.subtitle}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleQuoteSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{currentLang.quote.form.name} *</label>
                <input type="text" required ref={nameRef} defaultValue={quoteForm.name} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{currentLang.quote.form.email} *</label>
                <input type="email" required ref={emailRef} defaultValue={quoteForm.email} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{currentLang.quote.form.phone} *</label>
                <input type="tel" required ref={phoneRef} defaultValue={quoteForm.phone} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{currentLang.quote.form.service} *</label>
                <select required ref={serviceRef} defaultValue={quoteForm.service} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Selecione um serviço</option>
                  {Object.entries(SERVICES).map(([key, service]) => (
                    <option key={key} value={key}>{language === 'pt' ? service.name : service.nameEn}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{currentLang.quote.form.location} *</label>
              <input type="text" required ref={locationRef} defaultValue={quoteForm.location} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder={language === 'pt' ? 'Cidade, Distrito' : 'City, District'} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{currentLang.quote.form.description} *</label>
              <textarea required rows={4} ref={descriptionRef} defaultValue={quoteForm.description} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder={language === 'pt' ? 'Descreva detalhadamente o seu projeto...' : 'Describe your project in detail...'} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{currentLang.quote.form.urgency}</label>
                <select ref={urgencyRef} defaultValue={quoteForm.urgency} onChange={() => {}} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  {Object.entries(URGENCY_LEVELS).map(([key, level]) => (
                    <option key={key} value={key}>{language === 'pt' ? level.name : level.nameEn}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{currentLang.quote.form.budget}</label>
                <select ref={budgetRef} defaultValue={quoteForm.budget} onChange={() => {}} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Selecione uma faixa</option>
                  {BUDGET_RANGES.map((range) => (
                    <option key={range.value} value={range.value}>{language === 'pt' ? range.label : range.labelEn}</option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">{currentLang.quote.form.submit}</button>
          </form>
        </div>
      </div>
    </div>
  )
}
