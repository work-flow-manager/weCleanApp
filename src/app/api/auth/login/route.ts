import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const body = await request.json()
    const { email, password } = body
    
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Handle demo user case
    if (email === "demo@example.com" && password === "password123") {
      const response = NextResponse.json({ success: true, user: data.user, role: 'admin' })
      response.cookies.set('demoUserLoggedIn', 'true', { path: '/' })
      response.cookies.set('demoUserRole', 'admin', { path: '/' })
      return response
    }

    return NextResponse.json({ success: true, user: data.user })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred during login' },
      { status: 500 }
    )
  }
}