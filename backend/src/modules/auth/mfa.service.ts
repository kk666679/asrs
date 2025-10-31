import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class MfaService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate a new TOTP secret for a user
   */
  generateSecret(): { secret: string; otpauthUrl: string } {
    const secret = speakeasy.generateSecret({
      name: 'ASRS Halal Inventory',
      issuer: 'ASRS System',
    });

    return {
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url,
    };
  }

  /**
   * Generate QR code data URL for authenticator apps
   */
  async generateQRCode(otpauthUrl: string): Promise<string> {
    try {
      const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);
      return qrCodeDataUrl;
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Verify a TOTP token against a secret
   */
  verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2, // Allow 2 time windows (30 seconds each) for clock skew
    });
  }

  /**
   * Generate backup codes for account recovery
   */
  generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric codes
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  /**
   * Enable MFA for a user
   */
  async enableMfa(userId: string, secret: string): Promise<void> {
    const backupCodes = this.generateBackupCodes();

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: true,
        mfaSecret: secret,
        backupCodes: backupCodes,
      },
    });
  }

  /**
   * Disable MFA for a user
   */
  async disableMfa(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: false,
        mfaSecret: null,
        backupCodes: [],
      },
    });
  }

  /**
   * Verify MFA token or backup code
   */
  async verifyMfa(userId: string, token: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        mfaSecret: true,
        backupCodes: true,
      },
    });

    if (!user || !user.mfaSecret) {
      return false;
    }

    // First try TOTP verification
    if (this.verifyToken(user.mfaSecret, token)) {
      return true;
    }

    // If TOTP fails, check backup codes
    if (user.backupCodes.includes(token)) {
      // Remove the used backup code
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          backupCodes: user.backupCodes.filter((code) => code !== token),
        },
      });
      return true;
    }

    return false;
  }

  /**
   * Check if user has MFA enabled
   */
  async isMfaEnabled(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { mfaEnabled: true },
    });

    return user?.mfaEnabled || false;
  }

  /**
   * Get MFA setup data for a user
   */
  async getMfaSetup(
    userId: string,
  ): Promise<{ qrCode: string; secret: string; backupCodes: string[] } | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        mfaEnabled: true,
        mfaSecret: true,
        backupCodes: true,
      },
    });

    if (!user || user.mfaEnabled) {
      return null; // MFA already enabled or user not found
    }

    // Generate new secret if not exists
    let secret = user.mfaSecret;
    if (!secret) {
      const secretData = this.generateSecret();
      secret = secretData.secret;
    }

    const qrCode = await this.generateQRCode(
      `otpauth://totp/ASRS%20Halal%20Inventory:${userId}?secret=${secret}&issuer=ASRS%20System`,
    );

    const backupCodes =
      user.backupCodes.length > 0
        ? user.backupCodes
        : this.generateBackupCodes();

    return {
      qrCode,
      secret,
      backupCodes,
    };
  }
}
