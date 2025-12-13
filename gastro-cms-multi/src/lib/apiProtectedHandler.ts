// Protected API Handler with API Key validation
import { NextRequest, NextResponse } from 'next/server';
import { validateApiKeyMiddleware, hasPermission, checkRateLimit } from './apiKeyValidation';

interface ApiProtectionOptions {
  requiredResource?: string;
  requiredAction?: string;
  allowPublic?: boolean;
}

export function createApiProtectedHandler(
  options: ApiProtectionOptions = {},
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Allow public access if specified
      if (options.allowPublic) {
        return await handler(request);
      }

      // Validate API key
      const validation = await validateApiKeyMiddleware(request);
      if (!validation.isValid) {
        return NextResponse.json(
          { error: validation.error || 'Unauthorized' },
          { status: 401 }
        );
      }

      // Check specific permissions if required
      if (options.requiredResource && options.requiredAction) {
        if (!hasPermission(validation.apiKey, options.requiredResource, options.requiredAction)) {
          return NextResponse.json(
            { error: `Insufficient permissions. Required: ${options.requiredAction} on ${options.requiredResource}` },
            { status: 403 }
          );
        }
      }

      // Check rate limits
      const rateLimitOk = await checkRateLimit(validation.apiKey);
      if (!rateLimitOk) {
        return NextResponse.json(
          { error: 'Rate limit exceeded' },
          { status: 429 }
        );
      }

      // Add API key context to request
      (request as any).apiKey = validation.apiKey;
      (request as any).apiUser = validation.user;

      return await handler(request, {
        apiKey: validation.apiKey,
        apiUser: validation.user
      });
    } catch (error) {
      console.error('Error in API protected handler:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}
