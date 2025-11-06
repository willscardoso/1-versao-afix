import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabaseAdmin'

type QuoteBody = {
  name?: string
  email?: string
  phone?: string
  service?: string
  description?: string
  location?: string
  urgency?: string
  budget?: string
}

export async function POST(req: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ ok: false, error: 'Server misconfigured: SUPABASE_SERVICE_ROLE not set' }, { status: 500 })
  }

  try {
    const body: QuoteBody = await req.json()
    const email = (body.email || '').toString().trim()
    if (!email) return NextResponse.json({ ok: false, error: 'Email is required' }, { status: 400 })

    // Server-side validation: enforce reasonable max lengths
    const MAX = {
      name: 200,
      email: 254,
      phone: 50,
      service: 100,
      description: 2000,
      location: 200,
      urgency: 50,
      budget: 100
    }

    const tooLong: string[] = []
    if (body.name && String(body.name).length > MAX.name) tooLong.push('name')
    if (email.length > MAX.email) tooLong.push('email')
    if (body.phone && String(body.phone).length > MAX.phone) tooLong.push('phone')
    if (body.service && String(body.service).length > MAX.service) tooLong.push('service')
    if (body.description && String(body.description).length > MAX.description) tooLong.push('description')
    if (body.location && String(body.location).length > MAX.location) tooLong.push('location')
    if (body.urgency && String(body.urgency).length > MAX.urgency) tooLong.push('urgency')
    if (body.budget && String(body.budget).length > MAX.budget) tooLong.push('budget')
    if (tooLong.length) {
      return NextResponse.json({ ok: false, error: 'Fields too long', fields: tooLong }, { status: 400 })
    }

    const insertObj: any = {
      full_name: body.name || null,
      email,
      phone: body.phone || null,
      service: body.service || null,
      description: body.description || null,
      location: body.location || null,
      urgency: body.urgency || null,
      budget: body.budget || null,
      status: 'pendente'
    }

    const { data, error } = await (supabaseAdmin as any).from('projetos').insert(insertObj).select('id,created_at').maybeSingle()
    if (error) {
      return NextResponse.json({ ok: false, error: String(error.message || error) }, { status: 500 })
    }

    return NextResponse.json({ ok: true, projeto: data })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? String(err) }, { status: 500 })
  }
}
