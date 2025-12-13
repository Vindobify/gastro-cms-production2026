import { NextRequest } from 'next/server';
import { handleLogout } from '@/lib/authMiddleware';

export async function POST(req: NextRequest) {
  return await handleLogout(req);
}
