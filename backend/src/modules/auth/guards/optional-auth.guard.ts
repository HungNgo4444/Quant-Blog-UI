import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalAuthGuard extends AuthGuard('jwt') {
  // Override canActivate to make authentication optional
  canActivate(context: ExecutionContext) {
    // Always return true, allowing both authenticated and non-authenticated requests
    return super.canActivate(context);
  }

  // Override handleRequest to not throw error when no user is found
  handleRequest(err: any, user: any) {
    // If there's an error or no user, just return null (no user)
    // This makes authentication optional
    if (err || !user) {
      return null;
    }
    return user;
  }
}