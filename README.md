# StoicForge

A modern Next.js application with Stripe integration, Prisma ORM, and PlanetScale database.

## Local Development Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in required environment variables (see Configuration section)
4. Initialize the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## Testing Stripe Integration

1. Start the development server:
   ```bash
   npm run dev
   ```
2. Start the Stripe webhook listener:
   ```bash
   stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
   ```
3. Use test cards to simulate payment:
   - `4242 4242 4242 4242` - Successful payment
   - `4000 0000 0000 9995` - Declined payment

## Production Deployment

### Prerequisites

- Vercel account
- PlanetScale account
- Stripe account
- Clerk account for authentication

### PlanetScale Database Setup

1. Create a new database in PlanetScale
2. Create a new branch (e.g., `main`)
3. Generate connection credentials:
   - Go to "Settings" > "Passwords"
   - Generate a new password with "Production" access
   - Copy the connection string

### Vercel Deployment

1. Connect your repository to Vercel
2. Set the following environment variables:
   - `DATABASE_URL` - PlanetScale production connection string
   - `STRIPE_SECRET_KEY` - Stripe production secret key
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe production publishable key
   - `STRIPE_WEBHOOK_SECRET` - Production webhook secret
   - `CLERK_SECRET_KEY` - Clerk secret key
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
   - `NEXT_PUBLIC_URL` - Your production URL
   - `NEXT_PUBLIC_APP_URL` - Your production URL
3. Deploy the application

## Configuration

### Environment Variables

- **Database Configuration**:
  - `DATABASE_URL` - PlanetScale connection string
  
- **Stripe Configuration**:
  - `STRIPE_SECRET_KEY` - Stripe secret key
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
  - `STRIPE_WEBHOOK_SECRET` - Webhook secret for verifying events

- **Authentication**:
  - `CLERK_SECRET_KEY` - Clerk secret key
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key

- **Application URLs**:
  - `NEXT_PUBLIC_URL` - Public URL for the application
  - `NEXT_PUBLIC_APP_URL` - Application URL for server-side references

## Troubleshooting

### Database Connection Issues

1. **Verify Credentials**: 
   - Test your database connection using:
     ```bash
     NODE_ENV=production node scripts/test-prod-db.js
     ```
   - Generate new credentials in PlanetScale if necessary

2. **Connection Pooling**:
   - PlanetScale recommends specific connection pooling settings
   - The schema includes `connectionLimit` and `poolTimeout` settings

3. **Debug Endpoint**:
   - Visit `/api/debug-env` (when authenticated) to check environment setup

### Stripe Integration Issues

1. **Webhook Verification**:
   - Ensure `STRIPE_WEBHOOK_SECRET` is correctly set
   - Use the Stripe CLI to test webhooks locally

2. **API Version**:
   - Ensure the Stripe API version matches in all files

3. **Testing Mode**:
   - Use test keys for development (`sk_test_...` and `pk_test_...`)
   - Use live keys for production (`sk_live_...` and `pk_live_...`)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `node scripts/test-db-connection.js` - Test local database connection
- `NODE_ENV=production node scripts/test-prod-db.js` - Test production database connection

## Database Schema

The application uses Prisma ORM with MySQL on PlanetScale. Key models include:
- `User` - User accounts with credits and subscription information
- `UserSubscription` - Subscription details from Stripe
- `Prompt` - User-created content
- `StudySession` - User study sessions
- `Task` - User tasks
- `StudyMaterial` - Learning materials

## License

Copyright © 2023 StoicForge. All rights reserved.