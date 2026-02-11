import { NextResponse } from 'next/server';

const protectedRoutes = ['/dashboard', '/gallery', '/albums', '/groups', '/chat', '/profile'];

export function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const isProtected = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  if ((pathname === '/login' || pathname === '/register') && token) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/gallery/:path*', '/albums/:path*', '/groups/:path*', '/chat/:path*', '/profile/:path*', '/login', '/register'],
};
