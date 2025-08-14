import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value; // httpOnly cookie genellikle okunamaz
  const pathname = req.nextUrl.pathname;

  // Eğer kullanıcı login sayfasına gitmek isterse ve token varsa dashboard'a yönlendir
  if (pathname.startsWith('/login') && token) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Eğer kullanıcı admin sayfasına gitmek ister ve token yoksa login sayfasına yönlendir
  if (pathname.startsWith('/') && !pathname.startsWith('/login') && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['//:path*', '/'],
};
