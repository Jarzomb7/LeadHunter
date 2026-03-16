import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateProposal } from '@/lib/ai'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { clientDescription, projectScope, timeline, price, freelancerName } = body

  if (!clientDescription || !projectScope) {
    return NextResponse.json({ error: 'Client description and project scope are required' }, { status: 400 })
  }

  try {
    const content = await generateProposal({ clientDescription, projectScope, timeline, price, freelancerName })

    // Save to database
    const { data, error } = await supabase
      .from('proposals')
      .insert({
        user_id: user.id,
        client_description: clientDescription,
        project_scope: projectScope,
        timeline,
        price,
        content,
      })
      .select()
      .single()

    if (error) {
      // Return content even if save fails
      return NextResponse.json({ content, saved: false })
    }

    return NextResponse.json({ content, id: data.id, saved: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
