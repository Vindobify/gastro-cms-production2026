import { NextRequest } from 'next/server';
import { handleLogin } from '@/lib/authMiddleware';

export async function POST(req: NextRequest) {
  return await handleLogin(req);
}
