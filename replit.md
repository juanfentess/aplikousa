# AplikoUSA - Green Card DV Lottery Application Service

## Overview

AplikoUSA is a full-stack web application that provides professional assistance for applying to the US Diversity Visa (DV) Lottery program. The platform helps Albanian-speaking users submit accurate Green Card lottery applications by handling form completion, photo validation, and application submission for a fee of €20 per application.

The application offers three package tiers (Individual, Couple, Family) and includes user authentication, payment processing via Stripe, email notifications via Resend, and an admin dashboard for managing applications and email templates.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework:** React 18 with TypeScript
- **Routing:** Wouter (lightweight client-side routing)
- **Styling:** Tailwind CSS v4 with custom design tokens
- **UI Components:** Shadcn/ui component library built on Radix UI primitives
- **Forms:** React Hook Form with Zod validation
- **Animations:** Framer Motion for smooth transitions and interactions
- **State Management:** TanStack Query (React Query) for server state
- **Build Tool:** Vite

**Design System:**
- Primary color: `#0B1B3B` (dark blue)
- Secondary color: `#E63946` (red)
- Custom fonts: Inter (body), Montserrat (headings)
- Albanian language interface ("sq" locale)
- Responsive design with mobile-first approach

**Key Features:**
- Multi-step application form with package selection
- Photo upload with client-side preview
- Email verification flow
- Password reset functionality
- User dashboard with application tracking
- Admin dashboard for managing users and templates
- Landing page with marketing sections (Hero, Features, Pricing, FAQ, Testimonials)

**Routing Structure:**
- `/` - Landing page
- `/login`, `/register` - Authentication
- `/verify-email` - Email verification
- `/forgot-password`, `/reset-password` - Password recovery
- `/dashboard` - User dashboard
- `/admin/login`, `/admin/dashboard` - Admin panel
- `/terms`, `/privacy`, `/refunds` - Legal pages

### Backend Architecture

**Technology Stack:**
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database ORM:** Drizzle ORM
- **Session Management:** Express-session with connect-pg-simple (PostgreSQL session store)
- **Authentication:** Bcrypt for password hashing, custom JWT-like session tokens
- **File Upload:** Multer (implied by dependencies)
- **Email Service:** Resend API integration via Replit Connectors
- **Payment Processing:** Stripe with stripe-replit-sync for webhook handling

**API Architecture:**
The application follows a RESTful API pattern with the following route groups:
- `/api/auth/*` - User authentication (login, register, verify, password reset)
- `/api/admin/*` - Admin operations (login, user management, templates)
- `/api/stripe/*` - Payment processing and webhooks
- `/api/applications/*` - Application submission and retrieval
- `/api/users/*` - User profile management

**Session Management:**
- PostgreSQL-backed sessions using connect-pg-simple
- Session data stored in database for persistence across deployments
- Cookie-based authentication with httpOnly flags

**Document Generation:**
- Server-side HTML generation for application confirmation PDFs
- Template system in `server/documents.ts` for professional document output

**Email System:**
- Resend API integration through Replit Connectors
- Credential management via environment variables and connector API
- Template-based emails for verification, password reset, and confirmations
- Fallback domain: `noreply@aplikousa.com`

**Stripe Integration:**
- Product/Price management for three package tiers (Individual €150, Couple €250, Family €350)
- Webhook handling via stripe-replit-sync library
- Automatic schema migrations for Stripe data
- Checkout session creation for payment flow
- Background data synchronization from Stripe

### Data Storage Solutions

**Database:** PostgreSQL (via Neon serverless driver)

**Schema Design:**

1. **users** - Core user accounts
   - Authentication fields (email, password hash)
   - Profile data (firstName, lastName, phone, birthCountry, city)
   - Payment tracking (stripeCustomerId, stripeSubscriptionId, paymentStatus)
   - Email verification status
   - Package selection (individual, couple, family)
   - Online status tracking

2. **verificationCodes** - Email verification tokens
   - 6-digit codes with expiration
   - Foreign key to users

3. **passwordResetTokens** - Password recovery
   - UUID-based tokens with expiration
   - Foreign key to users

4. **emailTemplates** - Admin-managed email templates
   - Template content and metadata

5. **admins** - Administrative users
   - Separate from regular users for security

6. **applications** - DV Lottery applications
   - User application data and status tracking

7. **transactions** - Payment records
   - Stripe payment tracking and history

**ORM Patterns:**
- Drizzle ORM with TypeScript schema definitions
- Zod schema generation from Drizzle schemas
- Storage abstraction layer in `server/storage.ts`

### Authentication and Authorization

**User Authentication:**
- Email/password-based registration
- Bcrypt password hashing (cost factor configurable)
- Email verification requirement via 6-digit codes
- Password reset via time-limited tokens
- Session-based authentication using PostgreSQL sessions
- LocalStorage userId tracking on client

**Admin Authentication:**
- Separate admin login flow (`/admin/login`)
- Isolated admin credentials table
- Role-based access to admin dashboard

**Security Measures:**
- CSRF protection via express-session
- Password strength requirements (minimum 6 characters)
- Email verification before full account access
- Secure password reset flow with expiring tokens
- HttpOnly session cookies

### External Dependencies

**Payment Processing:**
- **Stripe** - Payment gateway for package purchases
  - Connector-based credential management
  - Environment-specific keys (development/production)
  - Webhook signature verification
  - Automatic product/price sync
  - API Version: 2024-11-20.basil

**Email Service:**
- **Resend** - Transactional email delivery
  - Replit Connector integration
  - API key management via connector API
  - Verified domain: aplikousa.com
  - Template-based email system

**Database:**
- **Neon** - Serverless PostgreSQL database
  - Connection via `@neondatabase/serverless` driver
  - DATABASE_URL environment variable
  - Connection pooling handled by Neon

**Third-Party Libraries:**
- **stripe-replit-sync** - Automated Stripe webhook and data synchronization
- **Radix UI** - Accessible component primitives for UI
- **TanStack Query** - Data fetching and caching
- **Framer Motion** - Animation library
- **Zod** - Runtime schema validation
- **React Hook Form** - Form state management

**Development Tools:**
- **Replit Vite Plugins:**
  - `@replit/vite-plugin-runtime-error-modal` - Error overlay
  - `@replit/vite-plugin-cartographer` - Development tooling
  - `@replit/vite-plugin-dev-banner` - Development banner
  - Custom `vite-plugin-meta-images` - OpenGraph image URL injection

**Build Process:**
- Client: Vite build to `dist/public`
- Server: esbuild bundling with selective dependency externalization
- Production: Single compiled server file (`dist/index.cjs`)
- Static file serving of built client assets

**Environment Variables Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `STRIPE_SECRET_KEY` - Stripe API key
- `REPLIT_CONNECTORS_HOSTNAME` - Replit connector API endpoint
- `REPL_IDENTITY` or `WEB_REPL_RENEWAL` - Replit authentication tokens
- `REPLIT_DOMAINS` - Deployment domain for webhook URLs
- `REPLIT_DEPLOYMENT` - Production flag