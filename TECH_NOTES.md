# Technical Notes

## What Was Built

I built a **Customer Portal POC** that connects to ServiceM8's API to let customers view their bookings, see details, check out attachments, and send messages. The whole thing is set up as a monorepo using Turborepo, which made it way easier to share code between the frontend and backend.

### The Big Picture

The project is split into two main apps:

- **Frontend (`apps/web`)**: Next.js 16 with the App Router, all server-rendered for better performance
- **Backend (`apps/api`)**: NestJS API server that talks to ServiceM8 and handles our own data

I went with a monorepo structure because even though Next.js can be full-stack, the requirements specifically asked for a separate Express.js backend. Using Turborepo let me share validators, types, and configs between both apps without duplicating code. It's like having a single source of truth, which is super helpful when you're working against a time limit.

### What Actually Works

**Authentication Flow**

- Users can register and log in with either email or phone number
- After logging in, they get automatically redirected to the bookings page
- Sessions are managed with NextAuth.js using JWT tokens
- The middleware handles all the redirect logic server-side, so there's no flash of content or weird loading states

**Bookings View**

- Shows all bookings associated with the customer's email (matching what's in ServiceM8)
- Each booking card shows the job number, status, address, and scheduled times
- Clicking a booking takes you to the detail page
- Everything is wrapped in Suspense with skeleton loaders, so it feels fast even while data is loading

**Booking Details**

- Full booking information including customer details, job info, and address
- Shows all file attachments that are linked to the booking
- Messages section where users can send messages related to that specific booking
- Messages are persisted in the backend (stored in JSON files for now)

**Server-Side Rendering**

- All pages are server components, which means better SEO and faster initial loads
- Data fetching happens on the server, so users see content immediately
- Only the interactive parts (like sending messages) are client components

### The Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, TailwindCSS
- **Backend**: NestJS (TypeScript-first, which fits the monorepo nicely)
- **Authentication**: NextAuth.js with JWT strategy
- **State Management**: TanStack Query for the client-side message sending
- **UI**: Radix UI primitives with shadcn/ui components
- **Build System**: Turborepo with pnpm workspaces

---

## My Approach & Reasoning

### Why Monorepo?

The requirements asked for a separate backend even though Next.js is already full-stack. I figured a monorepo would be the cleanest way to handle this. With Turborepo, I can:

- Share validation schemas (Zod) between frontend and backend
- Keep TypeScript types in sync automatically
- Share UI components if needed
- Have a single place for ESLint and TypeScript configs

This saved me a ton of time because I didn't have to maintain duplicate code or worry about types getting out of sync.

### Why NestJS Instead of Express?

I know the requirements said Express.js, but I went with NestJS because:

- It's TypeScript-first, which matches the rest of the stack
- The modular architecture fits perfectly with a monorepo
- Built-in dependency injection makes testing easier
- It's more structured, which helps when you're moving fast

I figured the core requirement was "separate backend," and NestJS is still a Node.js framework that is also using ExpressJS, so for me, it serves the same purpose. Plus, it's what I'm more comfortable with, and in a 5-hour time limit, that matters.

### Why JSON Files Instead of a Database?

I originally planned to use Prisma with SQLite in a shared package. That would've been the "proper" way to do it. But when I started integrating Prisma into the monorepo, I ran into a bunch of issues:

- Prisma client generation in monorepos can be tricky
- Getting the types to work across packages was eating up time
- The setup was more complex than I expected

So I made a pragmatic decision: stick with JSON files for users and messages. It's not production-ready, but it works for a POC and meets the requirement of "persisted data." The messages are stored in `apps/api/data/messages.json` and users in `apps/api/data/users.json`. It's simple, it works, and it let me focus on the core functionality instead of fighting with database setup.

### Server-Side Rendering Everywhere

I made sure all pages are server-rendered. This means:

- Better SEO (though not critical for a POC, it's good practice)
- Faster initial page loads
- Data fetching happens on the server, so users see content immediately
- Only interactive parts (like the message input) are client components

I wrapped the async data fetching in Suspense boundaries with skeleton loaders. This gives users visual feedback while data loads, making the app feel faster and more polished.

### The ServiceM8 Integration

I integrated with the real ServiceM8 API using their API key. The backend makes requests to ServiceM8's endpoints to:

- Fetch bookings by customer email
- Get detailed booking information
- Retrieve attachments for bookings

The API calls are made server-side, so the API key stays secure and never gets exposed to the client.

---

## Assumptions I Made

### About the Requirements

**Separate Backend**: Even though Next.js can be full-stack, I interpreted "Express.js backend" as needing a separate Node.js server. I used NestJS instead of Express because it's TypeScript-first and fits better with the monorepo structure. The core requirement (separate backend) is still met.

**Data Persistence**: The requirement said "data persistence method is at your discretion." I chose JSON files because:

- It's fast to implement
- It works for a POC
- It meets the requirement (messages are persisted)
- I can always swap it out for a real database later

**ServiceM8 API**: I assumed:

- The API key provided has access to bookings, booking details, and attachments
- Customer emails in ServiceM8 match the emails users register with
- The API returns data in a consistent format

**Authentication**: I assumed users can log in with either email OR phone number (not both required). This gives flexibility and matches common patterns.

**UI Design**: The requirement said "UI design may be minimal; functionality is prioritized." So I focused on making it work well rather than making it look fancy. I used shadcn/ui components for a clean, professional look without spending too much time on custom styling.

### About the Architecture

**Monorepo Structure**: I assumed that sharing code between frontend and backend was valuable enough to justify the monorepo setup. This turned out to be a good call—it saved time and kept things consistent.

**Server Components**: I assumed that server-side rendering would be beneficial even for a POC. It's a modern Next.js pattern, and it makes the app feel faster.

**Middleware for Routing**: I assumed that server-side redirects would be better than client-side. This prevents the "flash of login page" issue and makes the UX smoother.

---

## Potential Improvements

If I had more time (or if this were going to production), here's what I'd do:

### Immediate Wins

**Fetch Tags for Caching**: Right now, I'm using `cache: "no-store"` in the server requests. I'd add Next.js fetch tags (`revalidateTag`, `cache: { tags: [...] }`) so that when we fetch the same data, it uses cached results. This would make subsequent page loads much faster.

**Progress Bar for Navigation**: When users click on a booking to see details, there's a brief moment where nothing happens. Adding a progress bar at the top (like Next.js's `nprogress` or a custom solution) would give users visual feedback that navigation is happening. It's a small thing, but it makes the app feel more responsive.

**Prisma with SQLite in Shared Package**: This was my original plan. I'd set up Prisma in a shared package, generate the client, and export the types. This would:

- Eliminate code duplication
- Give us proper database types
- Make it easier to query data
- Set us up for production (just swap SQLite for PostgreSQL)

The tricky part is getting Prisma to work in a monorepo, but it's definitely doable with the right setup.

### Bigger Improvements

**Real Database**: Replace JSON files with PostgreSQL or MongoDB. This would handle concurrent writes better and scale properly.

**Real-time Updates**: Add WebSocket support so when a new message comes in, it appears automatically without refreshing.

**Better Error Handling**: Right now, errors are pretty basic. I'd add:

- Proper error boundaries
- User-friendly error messages
- Retry logic for failed API calls
- Logging for debugging

**Testing**: Add unit tests for services, integration tests for API endpoints, and E2E tests for critical flows. This would catch bugs early and make refactoring safer.

**Authentication Enhancements**: Add password reset, email verification, and maybe 2FA. For a production app, these are essential.

**Pagination**: If there are lots of bookings, loading them all at once isn't ideal. I'd add pagination or infinite scroll.

**Search & Filtering**: Let users search bookings or filter by status, date, etc.

---

## How AI Assisted My Workflow

### Reading Documentation for Me

Instead of digging through serviceM8s documentation, I'd ask the AI to explain how things work. For example:

- "What are the things needed?"
- "How to integrate it with my project?"

The AI would give me the relevant info and code examples, which was way faster than searching through documentation.

### Explaining Errors

When I hit errors (and I hit plenty), I'd paste the error message and ask the AI to explain what was wrong. It would:

- Break down what the error means
- Show me where the problem is
- Suggest fixes
- Explain why the fix works

This was especially helpful with TypeScript errors, which can be cryptic sometimes.

### Guiding Function Creation

When I needed to create a new function or component, I'd describe what I wanted, and the AI would:

- Suggest the function signature
- Show what parameters to pass
- Give me a starting implementation
- Explain the approach

For example, when creating the server-side API functions, I asked "How do I fetch data in a Next.js server component?" and the AI guided me through using `getServerSession` and making fetch requests.

### Architecture Decisions

I'd bounce ideas off the AI, like "Should I use a monorepo here?" or "Is server-side rendering worth it for this POC?" The AI would give me pros and cons, which helped me make informed decisions quickly.

### The Bottom Line

AI didn't write the code for me—I still made all the decisions and wrote everything. But it acted like a really good pair programmer who:

- Knows all the documentation
- Explains things clearly
- Catches mistakes early
- Suggests better patterns

This let me move faster while still understanding what I was building. In a 5-hour time limit, that was invaluable.

---
