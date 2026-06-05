import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Auth is handled client-side by ProtectedLayout components.
// This middleware is intentionally a pass-through.
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
