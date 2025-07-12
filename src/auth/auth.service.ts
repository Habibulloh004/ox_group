import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, VerifyOtpDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email } = loginDto;
    
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    let user;
    if (existingUser) {
      // Update existing user with new OTP
      user = await this.prisma.user.update({
        where: { email },
        data: {
          otp,
          otpExpiry,
        },
      });
    } else {
      // Create new user with default role MANAGER
      user = await this.prisma.user.create({
        data: {
          email,
          otp,
          otpExpiry,
          role: 'MANAGER', // Default role as specified
        },
      });
    }

    return {
      message: 'OTP sent successfully',
      otp, // In production, you wouldn't return this
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { email, otp } = verifyOtpDto;
    
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.otp !== otp || !user.otpExpiry || user.otpExpiry < new Date()) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Clear OTP after successful verification
    await this.prisma.user.update({
      where: { email },
      data: {
        otp: null,
        otpExpiry: null,
      },
    });

    // Generate JWT token
    const payload = { email: user.email, sub: user.id, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async validateUser(payload: any) {
    return await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        companies: {
          include: {
            company: true,
          },
        },
      },
    });
  }
}