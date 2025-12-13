import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: {
      DATABASE_URL: process.env.DATABASE_URL || 'NOT_SET',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT_SET',
      INTERNAL_API_URL: process.env.INTERNAL_API_URL || 'NOT_SET',
      NODE_ENV: process.env.NODE_ENV || 'NOT_SET',
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT_SET',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT_SET',
      CSRF_SECRET: process.env.CSRF_SECRET ? 'SET' : 'NOT_SET'
    },
    version: 'DEBUG-API-v1.0',
    deployment: 'vercel-debug-check'
  });
}
