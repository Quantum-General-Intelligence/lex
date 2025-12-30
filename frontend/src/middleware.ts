import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Define protected routes that require authentication
        const protectedRoutes = [
          '/query',
          '/documents',
          '/graph',
          '/sources',
          '/upload',
          '/compliance',
          '/comments',
          '/settings',
        ]

        const { pathname } = req.nextUrl

        // Check if the current path starts with any protected route
        const isProtectedRoute = protectedRoutes.some(
          (route) => pathname === route || pathname.startsWith(`${route}/`)
        )

        // If it's a protected route, require authentication
        if (isProtectedRoute) {
          return !!token
        }

        // Allow access to public routes
        return true
      },
    },
    pages: {
      signIn: '/login',
    },
  }
)

export const config = {
  // Match all routes except static files, api routes, and _next
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)',
  ],
}
