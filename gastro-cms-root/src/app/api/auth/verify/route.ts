import { NextRequest } from 'next/server';
import { handleVerifyToken } from '@/lib/authMiddleware';

export async function GET(req: NextRequest) {
  return await handleVerifyToken(req);
}
