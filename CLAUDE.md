# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Trotaglobo is a travel tracking application built with Next.js that allows users to record their past trips and plan future destinations with an interactive world map.

## Technology Stack
- **Framework**: Next.js 15.2.0 with App Router
- **Authentication**: Clerk
- **Database**: Supabase
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives with custom components
- **State Management**: React Query (TanStack Query)
- **Maps**: Google Maps API (@react-google-maps/api)
- **TypeScript**: Strict type checking enabled

## Essential Commands
```bash
# Development
npm run dev           # Starts development server with Turbopack

# Build & Production
npm run build         # Creates production build
npm run start         # Starts production server

# Code Quality
npm run lint          # Runs Next.js linting
```

## Architecture Overview

### Authentication Flow
- Uses Clerk for authentication via `ClerkProvider` in root layout
- Middleware (`src/middleware.ts`) protects routes using `clerkMiddleware`
- Session tokens are passed to Supabase for API authentication

### Data Layer Architecture
1. **Database**: Supabase PostgreSQL with row-level security
2. **API Communication**: 
   - Client-side queries use Clerk session tokens
   - `createClientSupabaseClient()` creates authenticated Supabase clients
3. **Data Flow**:
   - **Queries**: Located in `src/lib/queries/` (e.g., `get-trips.ts`)
   - **Commands**: Located in `src/lib/commands/` (e.g., `create-trip.ts`, `delete-trip.ts`)
   - **Adapters**: Transform database models to frontend types (`src/lib/adapter/`)
   - **DTOs**: Data transfer objects for type safety (`src/lib/dtos/`)

### Key Entities
- **Trip**: Main entity with title, description, dates, and cover image
- **TripCity**: Cities visited during a trip (many-to-one with Trip)
- **TripPlace**: Specific places within cities (many-to-one with TripCity)
- **TripTag**: Tags for categorizing trips (many-to-one with Trip)

### Frontend Architecture
- **Pages**: App router pages in `src/app/`
- **Components**: Modular components in `src/components/`
  - UI primitives in `src/components/ui/` (shadcn/ui pattern)
  - Feature components organized by domain (e.g., `src/components/trips/`)
- **Hooks**: Custom hooks in `src/hooks/`
- **State Management**: React Query for server state, local state with React hooks

### Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_KEY
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
```

## Key Patterns
1. **Authentication**: Always check for Clerk session before making API calls
2. **Data Fetching**: Use React Query with proper error handling
3. **Type Safety**: All API responses are typed through adapters
4. **Component Structure**: Follow existing patterns in `src/components/ui/`
5. **Responsive Design**: Use responsive modal component and media query hook
6. **Error Handling**: Display user-friendly error messages, handle loading states