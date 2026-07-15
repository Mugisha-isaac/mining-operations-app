import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Every protected route (gateway and core-service alike) sits behind this. */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
