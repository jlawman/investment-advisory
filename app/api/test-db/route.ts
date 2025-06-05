import { NextResponse } from 'next/server';
import { db, users } from '@/lib/db';

export async function GET() {
  try {
    // Test database connection
    const result = await db.select().from(users).limit(1);
    
    return NextResponse.json({
      status: 'Database connection successful',
      userCount: result.length,
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({
      status: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
    }, { status: 500 });
  }
}