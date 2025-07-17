import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const requestUrl = new URL(request.url)
  const formData = await request.formData()
  const email = String(formData.get('email'))
  const password = String(formData.get('password'))
  const fullName = String(formData.get('fullName') || '')
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${requestUrl.origin}/auth/callback`,
      data: {
        full_name: fullName,
        role: 'customer', // Default role for new users
      },
    },
  })

  if (error) {
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/register?error=${encodeURIComponent(error.message)}`,
      {
        status: 301,
      }
    )
  }

  return NextResponse.redirect(
    `${requestUrl.origin}/auth/register?message=${encodeURIComponent(
      'Check your email for the confirmation link.'
    )}`,
    {
      status: 301,
    }
  )
}