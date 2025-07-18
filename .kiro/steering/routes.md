# We-Clean Platform Routes

## Routing Architecture

The We-Clean platform uses Next.js App Router with internationalization (i18n) support. The routing system is structured to support multiple languages while maintaining a clean URL structure.

### Internationalization Setup

- **Supported Languages**: English (en), Spanish (es), Portuguese (pt), Arabic (ar)
- **Default Language**: English (en)
- **Locale Prefix**: "as-needed" (URLs don't show locale for default language)
- **Implementation**: Uses `next-intl` middleware for route internationalization

## Route Structure

All application routes are organized under the `src/app` directory following Next.js App Router conventions. The main routes are nested under the `[locale]` dynamic segment to support internationalization.

### Core Routes

| Route | Description | Access |
|-------|-------------|--------|
| `/` | Landing page/Home | Public |
| `/[locale]` | Localized home page | Public |
| `/auth/login` | Authentication - Login | Public |
| `/auth/register` | Authentication - Registration | Public |
| `/auth/forgot-password` | Password recovery | Public |

### Dashboard Routes

| Route | Description | Access |
|-------|-------------|--------|
| `/[locale]/dashboard` | Main dashboard (role-specific) | Authenticated |
| `/[locale]/dashboard/analytics` | Business analytics and reports | Admin, Manager |
| `/[locale]/dashboard/team` | Team management and performance | Admin, Manager |

### Job Management Routes

| Route | Description | Access |
|-------|-------------|--------|
| `/[locale]/jobs` | Job listing and management | Authenticated |
| `/[locale]/jobs/[id]` | Job details view | Authenticated |
| `/[locale]/jobs/new` | Create new job | Admin, Manager, Customer |
| `/[locale]/schedule` | Calendar view of scheduled jobs | Authenticated |
| `/[locale]/map` | Map view of jobs and team locations | Authenticated |

### Customer Routes

| Route | Description | Access |
|-------|-------------|--------|
| `/[locale]/profile` | User profile management | Authenticated |
| `/[locale]/reviews` | Customer reviews management | Authenticated |
| `/[locale]/invoices` | Invoice listing and management | Authenticated |
| `/[locale]/invoices/[id]` | Invoice details view | Authenticated |

### Settings and Support Routes

| Route | Description | Access |
|-------|-------------|--------|
| `/[locale]/settings` | User and account settings | Authenticated |
| `/[locale]/settings/branding` | White-label customization | Admin |
| `/[locale]/help` | Help center and documentation | Authenticated |
| `/[locale]/chat` | Support chat interface | Authenticated |
| `/[locale]/notifications` | User notifications center | Authenticated |

### API Routes

| Route | Description | Access |
|-------|-------------|--------|
| `/api/auth/*` | Authentication endpoints | Varies |
| `/api/jobs/*` | Job management endpoints | Authenticated |
| `/api/users/*` | User management endpoints | Authenticated |
| `/api/invoices/*` | Invoice management endpoints | Authenticated |
| `/api/notifications/*` | Notification endpoints | Authenticated |

## Route Guards

Routes are protected based on user authentication status and role permissions:

- **Public Routes**: Accessible without authentication
- **Authenticated Routes**: Require valid user session
- **Role-Based Routes**: Restricted based on user role (Admin, Manager, Team, Customer)

## Navigation Structure

The application uses a combination of:

- Main navigation sidebar/header (role-specific)
- Breadcrumb navigation for nested routes
- Tab navigation for related content sections
- Bottom navigation bar on mobile devices

## URL Parameters

Common URL parameters used throughout the application:

- `[locale]`: Language code (en, es, pt, ar)
- `[id]`: Resource identifier for specific items (jobs, invoices, etc.)
- `status`: Filter parameter for listing pages
- `date`: Date parameter for calendar and scheduling views
- `view`: Display mode parameter (list, grid, map, etc.)