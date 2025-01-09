import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { clerkClient } from '@clerk/clerk-sdk-node'

const publicRoutes = createRouteMatcher([
    '/',
    '/api/webhooks/register',
    '/sign-in',
    '/sign-up'
])



export default clerkMiddleware(async (auth, request) => {
    const { userId } = await auth()

    if (!userId && !publicRoutes(request)) {
        return NextResponse.redirect(new URL('/sign-in', request.url))
    }

    if (userId) {
        try {
            const user = await clerkClient.users.getUser(userId);
            const role = user.publicMetadata.role as string | undefined

            //admin redirection
            if (role === "admin" && request.nextUrl.pathname === "/dashboard") {
                return NextResponse.redirect(new URL("/admin/dashboard", request.url));
            }

            // Prevent non-admin users from accessing admin routes
            if (role !== "admin" && request.nextUrl.pathname.startsWith("/admin")) {
                return NextResponse.redirect(new URL("/dashboard", request.url));
            }

            // Redirect authenticated users trying to access public routes
            if (publicRoutes(request)) {
                return NextResponse.redirect(
                    new URL(role === 'admin' ? '/admin/dashboard' : '/dashboard', request.url)
                )
            }
        } catch (error) {
            console.error("Error while fetching user data from clerk",error);
            return NextResponse.redirect(new URL('/error',request.url))
            
        }
    }

})





export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
}