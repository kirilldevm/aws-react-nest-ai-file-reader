import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'crypto';

/** Header clients (e.g. Lambda HTTP invoke) send so only trusted callers can hit guarded routes. */
export const INTERNAL_SECRET_HEADER = 'x-internal-secret';

@Injectable()
export class InternalSecretGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{ headers: Record<string, unknown> }>();
    const expected = this.configService.getOrThrow<string>(
      'config.internal.pipelineSecret',
    );

    const rawHeader =
      req.headers[INTERNAL_SECRET_HEADER] ??
      req.headers[INTERNAL_SECRET_HEADER.toUpperCase()];

    const provided =
      typeof rawHeader === 'string' ? rawHeader.trim() : '';

    if (!provided || !this.safeEqual(provided, expected)) {
      throw new UnauthorizedException('Invalid or missing internal secret');
    }

    return true;
  }

  private safeEqual(a: string, b: string): boolean {
    try {
      const bufA = Buffer.from(a, 'utf8');
      const bufB = Buffer.from(b, 'utf8');
      if (bufA.length !== bufB.length) {
        return false;
      }
      return timingSafeEqual(bufA, bufB);
    } catch {
      return false;
    }
  }
}
