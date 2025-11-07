"use client";

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
// Login is a dedicated page at /login
import { Building2, Users, MessageSquare, BarChart3, Settings, Menu, X, Globe, Phone, Mail, MapPin, Star, ArrowRight, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { SERVICES, URGENCY_LEVELS, BUDGET_RANGES, COMPANY_INFO } from '@/lib/constants';
import { ServiceType, QuoteRequest } from '@/lib/types';
import BancaPage from '@/app/banca/page'
import QuotePageComponent from '@/components/QuotePage'

export default function Home() {
  const { language, toggleLanguage } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'home' | 'quote' | 'franchise' | 'dashboard' | 'chat'>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    name: '',
    email: '',
    phone: '',
    service: '' as ServiceType | '',
    description: '',
    location: '',
    urgency: 'media' as 'baixa' | 'media' | 'alta',
    budget: ''
  });
  // Use refs for form controls to avoid controlled re-renders that steal focus
  const nameRef = useRef<HTMLInputElement | null>(null)
  const emailRef = useRef<HTMLInputElement | null>(null)
  const phoneRef = useRef<HTMLInputElement | null>(null)
  const serviceRef = useRef<HTMLSelectElement | null>(null)
  const locationRef = useRef<HTMLInputElement | null>(null)
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null)
  const urgencyRef = useRef<HTMLSelectElement | null>(null)
  const budgetRef = useRef<HTMLSelectElement | null>(null)

  const [currentUser, setCurrentUser] = useState<{ id?: string; email?: string; full_name?: string; role?: string } | null>(null);
  const [projetos, setProjetos] = useState<any[]>([])
  const router = useRouter();

  useEffect(() => {
    // fetch current user (if any) to show their name on CTAs
    let mounted = true;
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        if (data?.ok && data.user) {
          // normalize role to lowercase for consistent checks across the app
          const role = data.user.role ? String(data.user.role).toLowerCase() : undefined
          setCurrentUser({ id: data.user.id, email: data.user.email, full_name: data.user.full_name, role });
        }
      })
      .catch(() => {
        /* ignore errors silently */
      });
    return () => { mounted = false };
  }, []);

  // Listen for global logout events (dispatched by other components) and update local state immediately
  useEffect(() => {
    const onLogout = () => {
      setCurrentUser(null)
      setActiveTab('home')
      setProjetos([])
    }
    try {
      window.addEventListener('afix:logout', onLogout as EventListener)
    } catch (e) {}
    return () => { try { window.removeEventListener('afix:logout', onLogout as EventListener) } catch (e) {} }
  }, [])

  // read `tab` query param to control which internal page is shown when on /
  const searchParams = useSearchParams()
  useEffect(() => {
    const tab = searchParams?.get('tab')
    if (tab && ['home','quote','franchise','dashboard','chat'].includes(tab)) {
      setActiveTab(tab as any)
    }
  }, [searchParams])

  // load projetos for cliente users from the secure server-side endpoint
  useEffect(() => {
    let mounted = true
    async function loadProjetos() {
      if (!currentUser || !currentUser.email) return
      const role = String(currentUser.role || '').toLowerCase()
      // allow cliente, franqueado and franqueador to load their projetos
      if (!['cliente', 'franqueado', 'franqueador'].includes(role)) return
      try {
        const res = await fetch('/api/me/projetos', { method: 'GET', credentials: 'same-origin' })
        const payload = await res.json()
        if (!mounted) return
        if (!res.ok || !payload.ok) {
          console.warn('Failed to load projetos via server endpoint', payload.error)
          return
        }
        setProjetos(payload.projetos || [])
      } catch (err) {
        // ignore
      }
    }
    loadProjetos()
    return () => { mounted = false }
  }, [currentUser])

  const t = {
    pt: {
      nav: {
        home: 'Início',
        quote: 'Pedir Orçamento',
        franchise: 'Franquia',
        dashboard: 'Dashboard',
        chat: 'Rede Franquiados'
      },
      hero: {
        title: 'Transforme o seu espaço com os melhores profissionais',
        subtitle: 'Conectamos você aos especialistas em remodelação, construção civil, pintura, canalização e betão. Qualidade garantida pelo Grupo AF.',
        cta: 'Pedir Orçamento Grátis',
        stats: {
          clients: 'Clientes Satisfeitos',
          projects: 'Projetos Concluídos',
          professionals: 'Profissionais Certificados'
        }
      },
      services: {
        title: 'Nossos Serviços',
        subtitle: 'Especialistas em todas as áreas da construção e remodelação'
      },
      quote: {
        title: 'Solicitar Orçamento',
        subtitle: 'Preencha o formulário e receba propostas dos melhores profissionais',
        form: {
          name: 'Nome completo',
          email: 'Email',
          phone: 'Telefone',
          service: 'Tipo de serviço',
          description: 'Descrição do projeto',
          location: 'Localização',
          urgency: 'Urgência',
          budget: 'Orçamento estimado',
          submit: 'Enviar Pedido'
        }
      },
      franchise: {
        title: 'Torne-se um Franquiado AFIX',
        subtitle: 'Junte-se à nossa rede de profissionais certificados',
        cost: 'Investimento: €2.000',
        benefits: [
          'Acesso exclusivo a pedidos de orçamento',
          'Rede de networking com outros profissionais',
          'Suporte técnico e comercial',
          'Certificação de qualidade Grupo AF'
        ],
        cta: 'Candidatar-se (Em breve)',
        network: {
          title: 'Rede de Franquiados',
          subtitle: 'Conecte-se com outros profissionais da rede AFIX'
        }
      },
      dashboard: {
        title: 'Dashboard Administrativo',
        stats: {
          clients: 'Total de Clientes',
          quotes: 'Orçamentos Ativos',
          completed: 'Projetos Finalizados',
          growth: 'Crescimento Mensal'
        }
      }
    },
    en: {
      nav: {
        home: 'Home',
        quote: 'Request Quote',
        franchise: 'Franchise',
        dashboard: 'Dashboard',
        chat: 'Franchise Network'
      },
      hero: {
        title: 'Transform your space with the best professionals',
        subtitle: 'We connect you to specialists in renovation, civil construction, painting, plumbing and concrete. Quality guaranteed by Grupo AF.',
        cta: 'Request Free Quote',
        stats: {
          clients: 'Satisfied Clients',
          projects: 'Completed Projects',
          professionals: 'Certified Professionals'
        }
      },
      services: {
        title: 'Our Services',
        subtitle: 'Specialists in all areas of construction and renovation'
      },
      quote: {
        title: 'Request Quote',
        subtitle: 'Fill out the form and receive proposals from the best professionals',
        form: {
          name: 'Full name',
          email: 'Email',
          phone: 'Phone',
          service: 'Service type',
          description: 'Project description',
          location: 'Location',
          urgency: 'Urgency',
          budget: 'Estimated budget',
          submit: 'Send Request'
        }
      },
      franchise: {
        title: 'Become an AFIX Franchisee',
        subtitle: 'Join our network of certified professionals',
        cost: 'Investment: €2,000',
        benefits: [
          'Exclusive access to quote requests',
          'Networking with other professionals',
          'Technical and commercial support',
          'Grupo AF quality certification'
        ],
        cta: 'Apply (Coming Soon)',
        network: {
          title: 'Franchise Network',
          subtitle: 'Connect with other AFIX network professionals'
        }
      },
      dashboard: {
        title: 'Administrative Dashboard',
        stats: {
          clients: 'Total Clients',
          quotes: 'Active Quotes',
          completed: 'Completed Projects',
          growth: 'Monthly Growth'
        }
      }
    }
  };

  const currentLang = t[language];

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // send to server API to persist the quote
    ;(async () => {
      try {
        const payload = {
          name: nameRef.current?.value || '',
          email: emailRef.current?.value || '',
          phone: phoneRef.current?.value || '',
          service: serviceRef.current?.value || '',
          description: descriptionRef.current?.value || '',
          location: locationRef.current?.value || '',
          urgency: urgencyRef.current?.value || '',
          budget: budgetRef.current?.value || ''
        }

        const res = await fetch('/api/quotes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        const data = await res.json()
        if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to submit')
        // use toast instead of alert
        toast({ title: language === 'pt' ? 'Orçamento enviado' : 'Quote sent', description: language === 'pt' ? 'O seu pedido foi recebido.' : 'Your request has been received.' })
        // clear uncontrolled inputs
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
    })()
  };

  const Navigation = () => (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-2xl font-bold text-gray-900">AFIX</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {Object.entries(currentLang.nav).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === key
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {label}
              </button>
            ))}
            <button
              onClick={toggleLanguage}
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              <Globe className="h-4 w-4 mr-1" />
              {language.toUpperCase()}
            </button>
            {/* Auth controls */}
            {currentUser ? (
              <button
                onClick={async () => {
                  try {
                    await fetch('/api/auth/logout', { method: 'POST' })
                  } catch (e) {}
                  setCurrentUser(null)
                  setActiveTab('home')
                  try { window.dispatchEvent(new CustomEvent('afix:logout')) } catch (e) {}
                  router.push('/')
                }}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                Logout
              </button>
            ) : (
              <button onClick={() => router.push('/login')} className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600">Login</button>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-blue-600"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {Object.entries(currentLang.nav).map(([key, label]) => (
              <button
                key={key}
                onClick={() => {
                  setActiveTab(key as any);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                  activeTab === key
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {label}
              </button>
            ))}
            <button
              onClick={toggleLanguage}
              className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600"
            >
              <Globe className="h-4 w-4 mr-2" />
              {language.toUpperCase()}
            </button>
            <div className="px-3 py-2">
              {currentUser ? (
                <button
                  onClick={async () => {
                      try {
                        await fetch('/api/auth/logout', { method: 'POST' })
                      } catch (e) {}
                      setCurrentUser(null)
                      setMobileMenuOpen(false)
                      setActiveTab('home')
                      try { window.dispatchEvent(new CustomEvent('afix:logout')) } catch (e) {}
                      router.push('/')
                    }}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600"
                >Logout</button>
              ) : (
                <button onClick={() => { setMobileMenuOpen(false); router.push('/login') }} className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600">Login</button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );

  const HomePage = () => (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {currentLang.hero.title}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              {currentLang.hero.subtitle}
            </p>
            <div className="inline-flex">
              <button
                onClick={() => setActiveTab('quote')}
                className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors inline-flex items-center"
              >
                {currentUser?.full_name ? `Pedir Orçamento — ${currentUser.full_name}` : 'Pedir Orçamento'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold">500+</div>
              <div className="text-blue-200">{currentLang.hero.stats.clients}</div>
            </div>
            <div>
              <div className="text-4xl font-bold">1000+</div>
              <div className="text-blue-200">{currentLang.hero.stats.projects}</div>
            </div>
            <div>
              <div className="text-4xl font-bold">50+</div>
              <div className="text-blue-200">{currentLang.hero.stats.professionals}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {currentLang.services.title}
            </h2>
            <p className="text-xl text-gray-600">
              {currentLang.services.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.entries(SERVICES).map(([key, service]) => (
              <div key={key} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {language === 'pt' ? service.name : service.nameEn}
                </h3>
                <p className="text-gray-600">
                  {language === 'pt' ? service.description : service.descriptionEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {language === 'pt' ? 'Pronto para começar o seu projeto?' : 'Ready to start your project?'}
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            {language === 'pt' 
              ? 'Receba orçamentos gratuitos dos melhores profissionais da sua região'
              : 'Get free quotes from the best professionals in your area'
            }
          </p>
          <button
            onClick={() => setActiveTab('quote')}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            {currentLang.hero.cta}
          </button>
        </div>
      </section>
    </div>
  );

  // use the standalone QuotePage component
  const QuotePage = () => <QuotePageComponent />

  const FranchisePage = () => (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {currentLang.franchise.title}
          </h1>
          <p className="text-xl text-gray-600">
            {currentLang.franchise.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="text-4xl font-bold text-blue-600 mb-2">€2.000</div>
              <p className="text-gray-600">{currentLang.franchise.cost}</p>
            </div>

            <div className="space-y-4 mb-8">
              {currentLang.franchise.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>

            <button
              disabled
              className="w-full bg-gray-400 text-white py-4 px-6 rounded-lg text-lg font-semibold cursor-not-allowed"
            >
              {currentLang.franchise.cta}
            </button>
            <p className="text-sm text-gray-500 text-center mt-2">
              {language === 'pt' 
                ? 'Funcionalidade será ativada em breve'
                : 'Feature will be activated soon'
              }
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {currentLang.franchise.network.title}
            </h3>
            <p className="text-gray-600 mb-6">
              {currentLang.franchise.network.subtitle}
            </p>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    JM
                  </div>
                  <div className="ml-3">
                    <div className="font-semibold text-gray-900">João Martins</div>
                    <div className="text-sm text-gray-500">Construção Civil - Porto</div>
                  </div>
                </div>
                <p className="text-gray-700 text-sm">
                  {language === 'pt' 
                    ? 'Alguém tem experiência com projetos de remodelação em apartamentos antigos?'
                    : 'Does anyone have experience with renovation projects in old apartments?'
                  }
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    AS
                  </div>
                  <div className="ml-3">
                    <div className="font-semibold text-gray-900">Ana Silva</div>
                    <div className="text-sm text-gray-500">Pintura - Lisboa</div>
                  </div>
                </div>
                <p className="text-gray-700 text-sm">
                  {language === 'pt' 
                    ? 'Acabei de finalizar um projeto incrível! Partilho algumas fotos no grupo.'
                    : 'Just finished an amazing project! Sharing some photos in the group.'
                  }
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg text-center">
              <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-blue-800 font-medium">
                {language === 'pt' 
                  ? 'Chat exclusivo para franquiados'
                  : 'Exclusive chat for franchisees'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const DashboardPage = () => (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {currentLang.dashboard.title}
          </h1>
          <p className="text-gray-600">
            {language === 'pt' 
              ? 'Visão geral da plataforma AFIX'
              : 'AFIX platform overview'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {currentLang.dashboard.stats.clients}
                </p>
                <p className="text-2xl font-bold text-gray-900">247</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {currentLang.dashboard.stats.quotes}
                </p>
                <p className="text-2xl font-bold text-gray-900">18</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {currentLang.dashboard.stats.completed}
                </p>
                <p className="text-2xl font-bold text-gray-900">156</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {currentLang.dashboard.stats.growth}
                </p>
                <p className="text-2xl font-bold text-gray-900">+23%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {language === 'pt' ? 'Pedidos Recentes' : 'Recent Requests'}
            </h3>
            {['cliente', 'franqueado', 'franqueador'].includes(String(currentUser?.role || '').toLowerCase()) ? (
              projetos.length === 0 ? (
                <p className="text-sm text-gray-600">{language === 'pt' ? 'Ainda não tem pedidos.' : 'You have no requests yet.'}</p>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {projetos.map((p) => (
                    <div key={p.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900">{p.full_name || p.email}</p>
                          <p className="text-sm text-gray-600">{p.service} • {p.location}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' : p.status === 'em_analise' ? 'bg-blue-100 text-blue-800' : p.status === 'finalizado' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {p.status === 'pendente' ? (language === 'pt' ? 'Pendente' : 'Pending') : p.status === 'em_analise' ? (language === 'pt' ? 'Em Análise' : 'In Analysis') : p.status === 'finalizado' ? (language === 'pt' ? 'Finalizado' : 'Finished') : (language === 'pt' ? 'Respondido' : 'Responded')}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">{new Date(p.created_at).toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="mt-3 text-sm text-gray-700">{p.description}</div>
                      <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                        {/* clients should not see contact info here; admins should */}
                        <div>
                          {String(currentUser?.role || '').toLowerCase() === 'admin' ? <span>{p.email} • {p.phone}</span> : null}
                        </div>
                        <div className="font-medium">{p.budget ? `€ ${p.budget}` : ''}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="space-y-4">
                {[
                  { name: 'Maria Santos', service: 'Remodelação', location: 'Lisboa', status: 'pendente' },
                  { name: 'Carlos Oliveira', service: 'Pintura', location: 'Porto', status: 'em_analise' },
                  { name: 'Ana Costa', service: 'Canalização', location: 'Braga', status: 'respondido' }
                ].map((request, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{request.name}</p>
                      <p className="text-sm text-gray-600">{request.service} • {request.location}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      request.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                      request.status === 'em_analise' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {request.status === 'pendente' ? (language === 'pt' ? 'Pendente' : 'Pending') :
                       request.status === 'em_analise' ? (language === 'pt' ? 'Em Análise' : 'In Analysis') :
                       (language === 'pt' ? 'Respondido' : 'Responded')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {language === 'pt' ? 'Serviços Mais Solicitados' : 'Most Requested Services'}
            </h3>
            <div className="space-y-4">
              {[
                { service: 'Remodelação', count: 45, percentage: 35 },
                { service: 'Pintura', count: 32, percentage: 25 },
                { service: 'Canalização', count: 28, percentage: 22 },
                { service: 'Construção Civil', count: 23, percentage: 18 }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{item.service}</span>
                      <span className="text-sm text-gray-600">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ChatPage = () => (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {currentLang.franchise.network.title}
          </h1>
          <p className="text-gray-600">
            {currentLang.franchise.network.subtitle}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg h-96 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center">
              <MessageSquare className="h-6 w-6 text-blue-600 mr-2" />
              <span className="font-semibold text-gray-900">
                {language === 'pt' ? 'Chat Geral - Rede AFIX' : 'General Chat - AFIX Network'}
              </span>
              <span className="ml-auto text-sm text-gray-500">
                {language === 'pt' ? '12 membros online' : '12 members online'}
              </span>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                JM
              </div>
              <div className="flex-1">
                <div className="flex items-center mb-1">
                  <span className="font-semibold text-gray-900">João Martins</span>
                  <span className="text-xs text-gray-500 ml-2">10:30</span>
                </div>
                <p className="text-gray-700">
                  {language === 'pt' 
                    ? 'Bom dia pessoal! Alguém tem experiência com isolamento térmico em casas antigas?'
                    : 'Good morning everyone! Does anyone have experience with thermal insulation in old houses?'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                AS
              </div>
              <div className="flex-1">
                <div className="flex items-center mb-1">
                  <span className="font-semibold text-gray-900">Ana Silva</span>
                  <span className="text-xs text-gray-500 ml-2">10:32</span>
                </div>
                <p className="text-gray-700">
                  {language === 'pt' 
                    ? 'Olá João! Sim, já fiz vários projetos. O importante é avaliar bem a estrutura primeiro.'
                    : 'Hi João! Yes, I\'ve done several projects. The important thing is to evaluate the structure first.'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                RC
              </div>
              <div className="flex-1">
                <div className="flex items-center mb-1">
                  <span className="font-semibold text-gray-900">Rui Costa</span>
                  <span className="text-xs text-gray-500 ml-2">10:35</span>
                </div>
                <p className="text-gray-700">
                  {language === 'pt' 
                    ? 'Concordo com a Ana. Posso partilhar alguns materiais que uso. São muito eficazes!'
                    : 'I agree with Ana. I can share some materials I use. They are very effective!'
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder={language === 'pt' ? 'Digite sua mensagem...' : 'Type your message...'}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled
              />
              <button
                disabled
                className="bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed"
              >
                {language === 'pt' ? 'Enviar' : 'Send'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {language === 'pt' 
                ? 'Chat disponível apenas para franquiados ativos'
                : 'Chat available only for active franchisees'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
      // If the activeTab explicitly requests the franchise view, honor it regardless
      // of authentication state (so clicking the "Franquia" menu opens the Home tab).
  if (activeTab === 'franchise') return <FranchisePage />
  if (activeTab === 'chat') return <ChatPage />

      // If user is authenticated, show the banca (project details) for clients,
      // otherwise show the admin Dashboard.
      if (currentUser) {
        const role = String(currentUser.role || '').toLowerCase()
        if (['cliente', 'franqueado', 'franqueador'].includes(role)) return <BancaPage />
        return <DashboardPage />
      }
    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'quote':
        return <QuotePage />;
      
      case 'dashboard':
        return <DashboardPage />;
      
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {renderContent()}
    </div>
  );
}