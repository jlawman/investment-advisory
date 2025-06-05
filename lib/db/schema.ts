import { pgTable, serial, text, timestamp, varchar, integer, jsonb, boolean, uuid, decimal } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 256 }).notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Investor boards - user's selected legendary investors
export const investorBoards = pgTable('investor_boards', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  name: varchar('name', { length: 256 }).notNull(),
  investors: jsonb('investors').notNull(), // Array of investor IDs
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Stocks/ETFs tracked
export const stocks = pgTable('stocks', {
  id: serial('id').primaryKey(),
  symbol: varchar('symbol', { length: 10 }).notNull().unique(),
  name: text('name').notNull(),
  currentPrice: decimal('current_price', { precision: 10, scale: 2 }),
  marketCap: text('market_cap'),
  peRatio: decimal('pe_ratio', { precision: 10, scale: 2 }),
  dividendYield: decimal('dividend_yield', { precision: 5, scale: 2 }),
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
});

// Recommendations generated
export const recommendations = pgTable('recommendations', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  boardId: uuid('board_id').references(() => investorBoards.id).notNull(),
  stockId: integer('stock_id').references(() => stocks.id).notNull(),
  consensus: jsonb('consensus').notNull(),
  individualRecommendations: jsonb('individual_recommendations').notNull(),
  marketResearch: jsonb('market_research').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// User portfolios
export const portfolios = pgTable('portfolios', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  name: varchar('name', { length: 256 }).notNull(),
  totalValue: decimal('total_value', { precision: 12, scale: 2 }).default('0'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Portfolio holdings
export const holdings = pgTable('holdings', {
  id: uuid('id').defaultRandom().primaryKey(),
  portfolioId: uuid('portfolio_id').references(() => portfolios.id).notNull(),
  stockId: integer('stock_id').references(() => stocks.id).notNull(),
  quantity: decimal('quantity', { precision: 12, scale: 4 }).notNull(),
  averageCost: decimal('average_cost', { precision: 10, scale: 2 }).notNull(),
  currentValue: decimal('current_value', { precision: 12, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  investorBoards: many(investorBoards),
  recommendations: many(recommendations),
  portfolios: many(portfolios),
}));

export const investorBoardsRelations = relations(investorBoards, ({ one, many }) => ({
  user: one(users, {
    fields: [investorBoards.userId],
    references: [users.id],
  }),
  recommendations: many(recommendations),
}));

export const stocksRelations = relations(stocks, ({ many }) => ({
  recommendations: many(recommendations),
  holdings: many(holdings),
}));

export const recommendationsRelations = relations(recommendations, ({ one }) => ({
  user: one(users, {
    fields: [recommendations.userId],
    references: [users.id],
  }),
  board: one(investorBoards, {
    fields: [recommendations.boardId],
    references: [investorBoards.id],
  }),
  stock: one(stocks, {
    fields: [recommendations.stockId],
    references: [stocks.id],
  }),
}));

export const portfoliosRelations = relations(portfolios, ({ one, many }) => ({
  user: one(users, {
    fields: [portfolios.userId],
    references: [users.id],
  }),
  holdings: many(holdings),
}));

export const holdingsRelations = relations(holdings, ({ one }) => ({
  portfolio: one(portfolios, {
    fields: [holdings.portfolioId],
    references: [portfolios.id],
  }),
  stock: one(stocks, {
    fields: [holdings.stockId],
    references: [stocks.id],
  }),
}));