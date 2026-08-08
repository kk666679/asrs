import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma.service';
import { getPermissionsForRole } from './permissions';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'defaultSecret',
    });
  }

  async validate(payload: any) {
    // Fetch user details from database to ensure current data
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        warehouseId: true,
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      return null;
    }

    // Get permissions based on user's role
    const permissions = getPermissionsForRole(user.role);

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      warehouseId: user.warehouseId,
      permissions: permissions,
    };
  }
}
