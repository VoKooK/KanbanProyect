import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "@/lib/jwt";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Retrieve token from cookies
  const token = request.cookies.get("token")?.value;

  // Route matching
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isKanbanPage = pathname.startsWith("/kanban");

  // Verify JWT if it exists
  const decoded = token ? await verifyJWT(token) : null;

  if (isKanbanPage && !decoded) {
    // Redirect unauthenticated user to login with callbackUrl
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && decoded) {
    // Redirect authenticated user to the Kanban board
    return NextResponse.redirect(new URL("/kanban", request.url));
  }

  return NextResponse.next();
}

// Specify matcher paths
export const config = {
  matcher: ["/kanban/:path*", "/login", "/register"],
};
