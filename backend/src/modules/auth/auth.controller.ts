import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { MfaSetupDto } from './dto/mfa-setup.dto';
import { MfaVerifyDto } from './dto/mfa-verify.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { MfaService } from './mfa.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mfaService: MfaService,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('mfa/verify')
  async verifyMfa(@Body() mfaVerifyDto: MfaVerifyDto & { userId: string }) {
    const { userId, token } = mfaVerifyDto;
    return this.authService.verifyMfa(userId, token);
  }

  @UseGuards(JwtAuthGuard)
  @Get('mfa/setup')
  async getMfaSetup(@Request() req) {
    const userId = req.user.sub;
    return this.mfaService.getMfaSetup(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('mfa/enable')
  async enableMfa(@Body() mfaSetupDto: MfaSetupDto, @Request() req) {
    const userId = req.user.sub;
    const { token } = mfaSetupDto;

    // First verify the token
    const isValid = await this.mfaService.verifyMfa(userId, token);
    if (!isValid) {
      throw new Error('Invalid MFA token');
    }

    // Get the setup data to retrieve the secret
    const setupData = await this.mfaService.getMfaSetup(userId);
    if (!setupData) {
      throw new Error('MFA setup not found');
    }

    // Enable MFA with the secret
    await this.mfaService.enableMfa(userId, setupData.secret);

    return {
      message: 'MFA enabled successfully',
      backupCodes: setupData.backupCodes,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('mfa/disable')
  async disableMfa(@Request() req) {
    const userId = req.user.sub;
    await this.mfaService.disableMfa(userId);
    return { message: 'MFA disabled successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('protected')
  async protectedRoute() {
    return { message: 'This is a protected route' };
  }
}
