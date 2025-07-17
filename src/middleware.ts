import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/server'

export async function middleware(request: NextRequest) {
  // Handle demo user - transfer from localStorage to cookies
  // This is needed because server components can't access localStorage
  const response = await updateSession(request)
  
  // Check for demo user in cookies
  const demoUserLoggedIn = request.cookies.get('demoUserLoggedIn')?.value
  const demoUserRole = request.cookies.get('demoUserRole')?.value
  
  // If this is a client-side navigation and we have localStorage items, they'll be in the request headers
  const lsHeaders = request.headers.get('x-demo-user')
  
  if (lsHeaders) {
    try {
      const demoData = JSON.parse(lsHeaders)
      if (demoData.loggedIn) {
        response.cookies.set('demoUserLoggedIn', 'true', { path: '/' })
        response.cookies.set('demoUserRole', demoData.role || 'admin', { path: '/' })
      }
    } catch (e) {
      console.error('Error parsing demo user headers:', e)
    }
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
}