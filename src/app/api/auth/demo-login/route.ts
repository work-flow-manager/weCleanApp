import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role = 'admin' } = body;
    
    // Create response with demo user cookies
    const response = NextResponse.json({ success: true });
    
    // Set cookies for demo user
    response.cookies.set('demoUserLoggedIn', 'true', { 
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
      sameSite: 'lax'
    });
    
    response.cookies.set('demoUserRole', role, { 
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
      sameSite: 'lax'
    });
    
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred during demo login' },
      { status: 500 }
    );
  }
}