# Project Structure

## Root Directory
- `.env.local` - Environment variables
- `next.config.js` - Next.js configuration
- `components.json` - shadcn/ui configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `tempo.config.json` - Tempo DevTools configuration

## Source Code (`src/`)

### App Structure (`src/app/`)
- `layout.tsx` - Root layout with providers
- `page.tsx` - Homepage
- `globals.css` - Global styles
- `dashboard/` - Dashboard pages
- `schedule/` - Scheduling pages

### Components (`src/components/`)
- `ui/` - Reusable UI components (shadcn/ui)
- `dashboard/` - Dashboard-specific components
- `jobs/` - Job management components
- `map/` - Map visualization components
- `theme-switcher.tsx` - Theme toggle component
- `tempo-init.tsx` - Tempo DevTools initialization

### Other Directories
- `src/contexts/` - React Context providers
- `src/lib/` - Utility functions and shared logic
- `src/types/` - TypeScript type definitions

## Database (`supabase/`)
- `migrations/` - Supabase database migrations

## Conventions

### File Naming
- React components: PascalCase (e.g., `JobCard.tsx`)
- Utility files: camelCase (e.g., `formatDate.ts`)
- Page components: `page.tsx` within appropriate route directories

### Component Organization
- UI components should be placed in `src/components/ui/`
- Feature-specific components should be placed in their respective feature folders
- Page components should be placed in the appropriate route directory under `src/app/`

### Data Fetching
- Server components should handle data fetching where possible
- Use Supabase client for database operations