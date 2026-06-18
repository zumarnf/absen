import { NextResponse } from "next/server";

// Auth is handled client-side by ProtectedLayout components.
// This proxy is intentionally a pass-through.
export function proxy() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
