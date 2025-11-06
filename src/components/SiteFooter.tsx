"use client"

import React from 'react'
import { Building2, Mail, Globe } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { COMPANY_INFO, SERVICES } from '@/lib/constants'

export default function SiteFooter() {
  const { language } = useLanguage()

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <Building2 className="h-8 w-8 text-blue-400" />
              <span className="ml-2 text-2xl font-bold">AFIX</span>
            </div>
            <p className="text-gray-300 mb-4">
              {language === 'pt' 
                ? 'Conectamos você aos melhores profissionais de construção e remodelação. Qualidade garantida pelo Grupo AF.'
                : 'We connect you to the best construction and renovation professionals. Quality guaranteed by Grupo AF.'
              }
            </p>
            <div className="flex space-x-4">
              <a href={`mailto:${COMPANY_INFO.email}`} className="text-gray-300 hover:text-white">
                <Mail className="h-5 w-5" />
              </a>
              <a href={COMPANY_INFO.website} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">
                <Globe className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">
              {language === 'pt' ? 'Serviços' : 'Services'}
            </h3>
            <ul className="space-y-2">
              {Object.entries(SERVICES).slice(0, 3).map(([key, service]) => (
                <li key={key}>
                  <span className="text-gray-300">{language === 'pt' ? service.name : service.nameEn}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">
              {language === 'pt' ? 'Contato' : 'Contact'}
            </h3>
            <div className="space-y-2">
              <div className="flex items-center text-gray-300">
                <Mail className="h-4 w-4 mr-2" />
                <span className="text-sm">{COMPANY_INFO.email}</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Globe className="h-4 w-4 mr-2" />
                <span className="text-sm">{COMPANY_INFO.website}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 AFIX - {language === 'pt' ? 'Todos os direitos reservados' : 'All rights reserved'} | 
            <a href={COMPANY_INFO.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300"> Grupo AF</a>
          </p>
        </div>
      </div>
    </footer>
  )
}
