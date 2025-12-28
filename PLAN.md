# dec31 — Build Plan

## Phase 0: Foundation ✅

### 0.1 Database Schema
- [x] Create `users` table (id, email, name, identity_statement, timezone, notification_time, onboarding_completed, created_at). Make the id be referencing the auth.users table in Supabase.
- [x] Create `votes` table (id, user_id, date, vote: 'closer' | 'further' | null, created_at)
- [x] Set up RLS policies (users can only access their own data)
- [x] Generate TypeScript types with `pnpm types`

### 0.2 Supabase Auth Setup
- [ ] Configure Google OAuth provider in Supabase dashboard *(human task)*
- [x] Create `/api/auth/callback` route handler for auth callback
- [x] Create Supabase client utilities (browser + server)
- [x] Set up auth middleware for protected routes

---

## Phase 1: Landing Page (/) ✅

### 1.1 Design & Copy
- [x] Hero section with core thesis: "Design the person, not the plan"
- [x] Brief manifesto highlights (identity > goals, systems > willpower, Dec 31 container)
- [x] CTA: "Begin your transformation"
- [x] Header with Login / Sign Up buttons
- [x] Footer (minimal)

### 1.2 Styling
- [ ] Dark/light mode toggle
- [x] Minimalistic black/white aesthetic
- [x] Mobile responsive
- [x] Smooth animations (subtle)

---

## Phase 2: Authentication (/auth/*) ✅

### 2.1 Auth Pages
- [x] `/auth/login` — Google OAuth button, minimal UI
- [x] `/auth/signup` — Same as login (Google OAuth handles both)
- [x] Redirect logic: new users → /onboarding, existing users → /dashboard

### 2.2 Auth Flow
- [x] `/api/auth/callback` — Handle OAuth callback, insert user row if new
- [x] Protected route middleware
- [x] Sign out functionality

---

## Phase 3: Onboarding (/onboarding) ✅

### 3.1 Flow Design
- [x] Step 0: "How should I call you?" — Pre-populate from Google name
- [x] Step 1: "Describe who you are on Dec 31, 2026." — Textarea, AI-assisted refinement optional
- [x] Progress indicator (minimal, e.g., "1 of 2")
- [x] Smooth transitions between steps

### 3.2 Data Persistence
- [x] Save name to `users.name`
- [x] Save identity statement to `users.identity_statement`
- [x] Mark `users.onboarding_completed = true`
- [x] Redirect to /dashboard on completion

---

## Phase 4: Dashboard (/dashboard) ✅

### 4.1 Layout
- [x] Header: Logo, settings icon, sign out
- [x] Identity statement display (editable with friction — e.g., confirm dialog)
- [x] View switcher tabs

### 4.2 Progress Views
- [x] **Days View**: Grid of day squares (green/red/orange/gray), hover for date, click orange to vote
- [x] **Months View**: 3x4 grid, each month shows proportional color segments
- [x] **Bar View**: Single horizontal segmented bar
- [x] **Graph View**: Line chart with green up-segments, red down-segments, orange flat
- [x] **Compound View**: Score starting at 100, 1.01^green × 0.99^red, show projections
- [x] **Overview**: All views on one screen

### 4.3 Voting Modal
- [x] Click on orange (unfilled) day → modal with question: "Did you feel closer or further from your Dec 31 identity?"
- [x] Two buttons: "Closer" (green) / "Further" (red)
- [x] Update `votes` table, refresh view

---

## Phase 5: Daily Vote System

### 5.1 Email Notifications
- [ ] Supabase Edge Function for sending daily vote email via Resend
- [ ] Email contains two links: "Closer" / "Further" with secure tokens
- [ ] `/api/vote` endpoint to handle email link clicks

### 5.2 Cron Job
- [ ] Supabase pg_cron to trigger Edge Function
- [ ] Respect user's timezone and notification_time preference
- [ ] Only send if user hasn't voted for today

### 5.3 Settings Page (/settings) ✅
- [x] Timezone selector (default: user's local)
- [x] Notification time picker (default: 9pm)
- [ ] Email preferences

---

## Phase 6: Polish & Launch

### 6.1 UX Polish
- [x] Loading states
- [x] Error handling (auth error page)
- [ ] Empty states
- [x] Animations & transitions

### 6.2 Mobile Optimization
- [ ] Responsive layouts for all views
- [ ] Touch-friendly interactions

### 6.3 Testing
- [ ] Auth flow
- [ ] Onboarding flow
- [ ] Voting flow
- [ ] Email delivery

---

## Technical Notes

**Stack**:
- Next.js 16 (App Router)
- Supabase (Auth, Database, Edge Functions, pg_cron)
- ShadCN + TailwindCSS
- Recharts (for Graph/Compound views)
- Resend (email)
- Vercel AI SDK v6 with Google Gemini (for "Dec" AI)

**Date Range**:
- Start: Jan 1, 2025 (or user signup date, whichever is later)
- End: Dec 31, 2026 (fixed)
- Total possible days: ~730

**Color Scheme**:
- Green: `#22c55e` (closer)
- Red: `#ef4444` (further)
- Orange: `#f97316` (unfilled/pending)
- Gray: `#9ca3af` (future)

---

## Build Order (Recommended)

1. **Phase 0** — Foundation (DB + Auth setup)
2. **Phase 2** — Auth pages & callback
3. **Phase 3** — Onboarding
4. **Phase 4.1-4.3** — Dashboard (Days view first, then others)
5. **Phase 1** — Landing page (can develop in parallel)
6. **Phase 5** — Daily vote email system
7. **Phase 6** — Polish

---

## Human Developer Tasks

- [ ] Configure Google OAuth in Supabase dashboard
- [ ] Set up Resend account and verify domain
- [ ] Deploy to Vercel and configure environment variables
- [ ] Enable pg_cron extension in Supabase
