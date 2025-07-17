import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Create response and clear demo user cookies
    const response = NextResponse.json({ success: true });
    
    // Clear cookies for demo user
    response.cookies.set('demoUserLoggedIn', '', { 
      path: '/',
      maxAge: 0,
      sameSite: 'lax'
    });
    
    response.cookies.set('demoUserRole', '', { 
      path: '/',
      maxAge: 0,
      sameSite: 'lax'
    });
    
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred during demo logout' },
      { status: 500 }
    );
  }
}