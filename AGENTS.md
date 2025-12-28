# dec31

dec31 (stylized lowercase) is a modern, minimalistic human behavior engineering platform.

## Overview

Read MANIFESTO.md for the full manifesto that should guide all product and engineering decisions of dec31.

## Features

### -1. Landing Page (/)

Build a polished, elegant, minimalistic landing page to convey core elements of the Manifesto.
Have CTA to sign up.
Have log in / sign up buttons.
The auth callback is at /api/callback. This needs to handle post-signup flows (e.g. inserting Supabase row).

### 0. Authentication (/auth/login, /auth/signup)

Authentication will be handled through Supabase and Google OAuth.

### 1. Onboarding (/onboarding)

An extremely minimalistic step-by-step onboarding flow for new users. One thoughtful question at a time. Seamless input and submission.

Q0. "How should I call you?" (name). This should be pre-populated from the first name of Google OAuth.

Q1. "Describe who you are on Dec 31, 2026."

### 2. Dashboard (/dashboard)

Show the core identity statement somewhere. (Able to edit, but intentionally frictioned).

A series of progress views.
  - Days: squares in grids (padding between squares), with each square representing a day. Green if closer, red if further, orange if unfilled, gray if not happened yet. Hover over each square (day) to see the date (e.g. Aug 15).
  - Months: 3x4 grid of 12 months. each month is a larger square, each square segmented with same color scheme by proportion
  - Bar: same color scheme, but as a single segmented horizontal bar (green, red, orange, gray).
  - Graph: line graph with time as horizontal axis. line segment is green and goes slightly up for each green day, it's red and goes slightly down for each red day, flat for orange (don't show gray).
  - Compound: starting with a score of 100, multiply 1.01 (i.e. 1% increase) if green, 0.99 (i.e. 1% decrease) if red, 1.00 if orange. Display current overall score to 1 decimal place. Show dotted trajectory & projected score if all remaining days are green (i.e. upward exponential graph) and if all remaining days are red (i.e. downward exponential graph), i.e. their projected Dec 31 self.
  - Overview: all the charts/views in a single screen.

### 3. Daily Vote

Each day, the user is asked to put a simple vote to this question: "Do you feel closer or further from your dec31 identity?"

This can be achieved with Supabase cron (pg_cron extension) with Supabase Edge Function that uses Resend to send an email to notify the user once a day. User can click on a "Closer" or "Further" hyperlink/button in the email to submit their vote.

The web platform should also support a way to vote on a day. E.g. in the dashboard by clicking on an orange (i.e. unfilled) day square.

In a separate settings page, the user can set their timezone (initially defaulted to their local timezone), and what time of their day they want a notification (initially defaulted to the user's 9pm).

## Notes

The UI/UX and design must be polished, modern, minimalistic, smooth, simple, elegant. Clean light mode and clean dark mode. Black and white as the main color scheme (which is shadcn's default).

Use NextJS, ShadCN and TailwindCSS. Use the shadcn MCP server to install new shadcn components as needed.

The UI should be interactive for both desktop and mobile screen sizes.

Write modular, clean, reusable code. If a file is too long, split code up into different files. You can create custom UI components under frontend/components.

Our database will be Supabase. Use the Supabase MCP server as necessary. Create and apply DB migrations to define the schema. Run `pnpm types` to pull down the latest TypeScript schemas for the database into frontend/lib/supabase/database.types.ts. Use UUID for all IDs. Create foreign keys as necessary. Create sensible RLS policies. Use best practices for database design.

Our AI will be through Vercel AI SDK v6. Specifically, use @ai-sdk/google (`createGoogleGenerativeAI`).

Our AI's personified name is "Dec".

See frontend/.env.example for the environment variables that have already been set (in frontend/.env).

Anything you're unsure about, use web search (e.g. web search tool, Nia MCP, Exa MCP) and/or read the appropriate documentation (e.g. Vercel, Resend).

Anything that you need me as the human developer to do (e.g. configure something in Supabase or Resend), you can tell me to do, and I will do it.
