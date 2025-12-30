# Lex Development Session Context

**Last Updated:** December 30, 2024

## Project Overview

Lex is a legal intelligence platform built with:
- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Python FastAPI (separate service)
- **Database:** Neo4j (knowledge graph)
- **Auth:** NextAuth.js with credentials provider

## What Was Accomplished Today

### 1. Authentication Session Persistence Fix
**Problem:** After signing in, navigating to other pages would redirect back to login.

**Solution:**
- Changed middleware from `withAuth` wrapper to direct `getToken` call
- Added explicit cookie configuration with proper `sameSite` and `secure` settings

**Files Modified:**
- `frontend/src/middleware.ts` - Uses `getToken` directly instead of `withAuth`
- `frontend/src/lib/auth.ts` - Added cookie configuration

### 2. Constellation Background Component
**Created:** `frontend/src/components/ConstellationBackground.tsx`

A canvas-based animated background with:
- Dynamic floating nodes with pulsing animations
- Connection lines between nearby nodes
- Animated flow particles along connections
- Mouse interaction (attraction toward cursor on main page)
- Configurable props: `nodeCount`, `connectionDensity`, `colorScheme`, `speed`, `opacity`, `interactive`, `showOrbs`, `showGrid`

**Added to pages:**
- Main page (`/`) - 35 nodes, mixed colors, interactive
- Login page (`/login`) - 20 nodes, blue, non-interactive
- Query page (`/query`) - 15 nodes, blue
- Graph page (`/graph`) - 20 nodes, purple
- Documents page (`/documents`) - 15 nodes, blue
- Sources page (`/sources`) - 18 nodes, purple

**CSS additions in `globals.css`:**
- `animate-pulse-slow` - 8s gentle pulse
- `animate-float` - 12s floating motion
- `animate-shimmer` - gradient shimmer effect

### 3. Knowledge Graph Interactivity
**File:** `frontend/src/components/GraphViewer.tsx`

Added to ForceGraph2D:
- `enableNodeDrag={true}`
- `enableZoomInteraction={true}`
- `enablePanInteraction={true}`
- `onNodeDragEnd` handler to fix node position after drag
- Increased `nodeRelSize` to 8

### 4. Custom Lex Logo
**Created:** `frontend/src/components/LexLogo.tsx`

Current design: Simple constellation-style "L" with:
- Two lines forming an L shape (muted gray `#94a3b8`)
- Three subtle nodes at corners (soft gray `#cbd5e1`)
- Gentle glow effect with reduced blur
- Subtle pulsing animation on nodes
- Square aspect ratio (1:1)

**Integrated into:**
- Navigation component (`frontend/src/components/Navigation.tsx`)
- Main page footer
- Login page header

**Props:**
- `size` - controls dimensions (default 36)
- `animated` - toggle pulsing (default true)
- `className` - additional CSS classes

## Key Files Reference

### Core Components
- `frontend/src/components/LexLogo.tsx` - Logo component
- `frontend/src/components/ConstellationBackground.tsx` - Animated background
- `frontend/src/components/Navigation.tsx` - Main nav with logo
- `frontend/src/components/GraphViewer.tsx` - Knowledge graph visualization

### Pages
- `frontend/src/app/page.tsx` - Main landing page
- `frontend/src/app/login/page.tsx` - Login page
- `frontend/src/app/query/page.tsx` - Query interface
- `frontend/src/app/graph/page.tsx` - Knowledge graph explorer
- `frontend/src/app/documents/page.tsx` - Document library
- `frontend/src/app/sources/page.tsx` - Data sources

### Auth
- `frontend/src/lib/auth.ts` - NextAuth configuration
- `frontend/src/middleware.ts` - Route protection

### Styling
- `frontend/src/app/globals.css` - Global styles + custom animations
- `frontend/tailwind.config.ts` - Tailwind configuration with custom colors (vulcan, accent)

## Color Palette
- **vulcan-900:** `#0a0e1a` (dark background)
- **vulcan-800:** `#111827` (cards/sections)
- **vulcan-700:** `#1f2937` (borders)
- **accent:** `#3b82f6` (blue)
- **purple:** `#8b5cf6`

## Demo Accounts
- Admin: `admin@lex.dev` / `admin123`
- Analyst: `analyst@lex.dev` / `analyst123`
- Demo: `demo@lex.dev` / `demo123`

## Pending/Future Work
- Consider refining the logo further if needed
- Potential animation tweaks to constellation background
- Any additional UI polish requests

## Running the Project

```bash
cd frontend
npm run dev    # Development server on localhost:3000
npm run build  # Production build
```

Backend runs separately (Python FastAPI).

## Notes
- The logo went through several iterations today (justice scale, "LEX" text, finally settled on simple "L")
- Constellation background is intentionally subtle on most pages (opacity 0.3-0.4)
- Main page has interactive constellation that responds to mouse movement
