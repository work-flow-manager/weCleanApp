# Technology Stack

## Core Technologies
- **Framework**: Next.js 14.2.x (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Maps**: MapLibre GL
- **State Management**: React Context API
- **Forms**: React Hook Form

## UI Components
- shadcn/ui component system
- Radix UI primitives
- Lucide React icons
- Embla Carousel
- Vaul for drawers
- React Day Picker for date selection

## Development Tools
- TypeScript for type safety
- Prettier for code formatting
- Tempo DevTools for development
- Next.js App Router (RSC enabled)

## Common Commands

```bash
# Development
npm run dev        # Start development server

# Production
npm run build      # Build for production
npm run start      # Start production server
```

## Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `NEXT_PUBLIC_TEMPO`: Enable Tempo DevTools (optional)

## Code Style
- Use TypeScript for all new files
- Follow React Server Components patterns where appropriate
- Use Tailwind utility classes for styling
- Leverage shadcn/ui component patterns