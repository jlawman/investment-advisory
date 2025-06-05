# Investment Advisory Platform

AI-powered investment recommendations from legendary investors like Warren Buffett, Cathie Wood, Bill Ackman, and Bill Gross.

## Features

- **Investor Board Selection**: Choose 2-5 legendary investors to form your personal advisory board
- **Stock Search**: Search for stocks and ETFs with autocomplete
- **AI Recommendations**: Get personalized investment recommendations based on each investor's philosophy
- **Consensus Analysis**: See aggregated recommendations with confidence scores
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS v4
- **Backend**: Next.js API Routes
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Neon account for PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   bun install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Add your `DATABASE_URL` from Neon

4. Set up the database:
   ```bash
   bun run db:push
   ```

5. Run the development server:
   ```bash
   bun dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Database Commands

```bash
# Generate migrations from schema changes
bun run db:generate

# Push schema changes to database
bun run db:push

# Open Drizzle Studio to view/edit data
bun run db:studio
```

## Deployment

### Vercel Deployment

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Set environment variables in Vercel:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string

The app will be deployed with:
- Automatic HTTPS
- Global CDN
- Serverless functions for API routes

## Project Structure

```
investment-advisory/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── recommendations/ # AI recommendation endpoint
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── Header.tsx         # Navigation header
│   ├── InvestorCard.tsx   # Investor selection cards
│   ├── StockSearch.tsx    # Stock search component
│   └── RecommendationDisplay.tsx # Recommendation modal
├── lib/                   # Utility libraries
│   └── db/               # Database configuration
│       ├── schema.ts     # Drizzle schema
│       └── index.ts      # Database connection
├── types/                 # TypeScript types
│   └── recommendation.ts  # API types
└── screenshots/          # UI component screenshots

```

## API Endpoints

### POST /api/recommendations
Generate investment recommendations based on selected investors.

Request body:
```json
{
  "selectedInvestors": ["buffett", "wood"],
  "stockSymbol": "AAPL",
  "investmentAmount": 10000
}
```

## License

MIT