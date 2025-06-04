import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken');
  
  // Các route cần authentication
  const protectedPaths = ['/dashboard', '/posts/create', '/profile'];
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath && !accessToken) {
    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    return response;
  }

  // Các route không cần auth khi đã đăng nhập
  const authPaths = ['/auth/login', '/auth/register'];
  const isAuthPath = authPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (isAuthPath && accessToken) {
    const response = NextResponse.redirect(new URL('/', request.url));
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/posts/create/:path*',
    '/profile/:path*',
    '/auth/:path*'
  ],
}; 