import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware is currently not needed since we removed i18n
// It's kept as a placeholder for future middleware functionality
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

// No paths need middleware processing currently
export const config = {
  matcher: []
};
