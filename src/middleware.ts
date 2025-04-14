import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Custom middleware function
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  // Just to see what path we're dealing with
  console.log("Middleware path:", url.pathname);

  // If the user is not logged in (no token) and tries to access /profile
  if (!token && url.pathname.startsWith("/profile")) {
    // Redirect them to /sign-in (or wherever you want)
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // If token exists:
  if (token) {
    // Example: If user tries to go to /sign-in, /sign-up, /verify, or root "/", send them to /feed
    if (
      url.pathname.startsWith("/sign-in") ||
      url.pathname.startsWith("/sign-up") ||
      url.pathname.startsWith("/verify") ||
      url.pathname === "/"
    ) {
      return NextResponse.redirect(new URL("/feed", request.url));
    }

    // Example: if user tries to go to "/u/", redirect them somewhere
    // (not sure what your original logic is)
    if (url.pathname.startsWith("/u/")) {
      return NextResponse.redirect(new URL("/feed", request.url));
    }
  } else {
    // If no token and user tries to go to /feed, redirect them to /sign-in
    if (url.pathname.startsWith("/feed")) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  // Otherwise allow the request
  return NextResponse.next();
}

// Our config with the updated matcher
export const config = {
  matcher: [
    "/sign-in",
    "/sign-up",
    "/",
    "/feed/:path*",
    "/verify/:path*",
    "/profile/:path*", // Secure /profile
  ],
};

// Export default next-auth middleware
export { default } from "next-auth/middleware";
