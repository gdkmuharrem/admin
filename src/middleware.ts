import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const { pathname } = req.nextUrl;

  // Login sayfasında token varsa dashboard'a yönlendir
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Dashboard veya diğer admin sayfalarına token yoksa login'e yönlendir
  const adminPaths = ['/dashboard', '/admin'];
  if (adminPaths.some(path => pathname.startsWith(path)) && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*'], // tüm sayfalar için middleware çalışır
};
