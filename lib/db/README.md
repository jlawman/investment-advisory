# Database Setup

This project uses Neon (PostgreSQL) with Drizzle ORM.

## Initial Setup

1. Create a Neon account at https://neon.tech
2. Create a new project and database
3. Copy the connection string
4. Create a `.env.local` file in the project root
5. Add your database URL: `DATABASE_URL=your_connection_string`

## Database Commands

```bash
# Generate migrations from schema changes
bun run db:generate

# Push schema changes to database
bun run db:push

# Open Drizzle Studio to view/edit data
bun run db:studio
```

## Schema Overview

- **users**: Application users
- **investor_boards**: User's selected advisory boards
- **stocks**: Stock/ETF information
- **recommendations**: Generated investment recommendations
- **portfolios**: User portfolio tracking
- **holdings**: Individual stock holdings in portfolios

## Development Workflow

1. Modify schema in `lib/db/schema.ts`
2. Run `bun run db:generate` to create migration
3. Run `bun run db:push` to apply changes
4. Use `bun run db:studio` to verify changes