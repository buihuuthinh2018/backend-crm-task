import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { LoginDto, RegisterDto, GoogleAuthDto } from './dto/auth.dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private supabaseService: SupabaseService,
  ) {}

  /**
   * Validate user credentials
   */
  async validateUser(email: string, password: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && user.password && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  /**
   * Login with email/password
   */
  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  /**
   * Register new user
   */
  async register(registerDto: RegisterDto) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        name: registerDto.name,
        avatar: registerDto.avatar,
        password: hashedPassword,
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    return this.generateTokens(userWithoutPassword);
  }

  /**
   * Authenticate with Google (Supabase OAuth)
   */
  async googleAuth(googleAuthDto: GoogleAuthDto) {
    // Verify token with Supabase
    const supabaseUser = await this.supabaseService.verifyToken(googleAuthDto.accessToken);
    
    if (!supabaseUser) {
      throw new UnauthorizedException('Invalid Google token');
    }

    // Find or create user in our database
    let user = await this.prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
    });

    if (!user) {
      // Also check by email
      user = await this.prisma.user.findUnique({
        where: { email: supabaseUser.email },
      });

      if (user) {
        // Link existing user with Supabase
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { supabaseId: supabaseUser.id },
        });
      } else {
        // Create new user with upsert to handle race conditions
        user = await this.prisma.user.upsert({
          where: { email: supabaseUser.email },
          update: { 
            supabaseId: supabaseUser.id,
            name: supabaseUser.user_metadata?.full_name || supabaseUser.email.split('@')[0],
            avatar: supabaseUser.user_metadata?.avatar_url,
          },
          create: {
            email: supabaseUser.email,
            name: supabaseUser.user_metadata?.full_name || supabaseUser.email.split('@')[0],
            avatar: supabaseUser.user_metadata?.avatar_url,
            supabaseId: supabaseUser.id,
          },
        });
      }
    }

    const { password: _, ...userWithoutPassword } = user;
    return this.generateTokens(userWithoutPassword);
  }

  /**
   * Get current user profile
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  /**
   * Generate JWT tokens
   */
  private generateTokens(user: Omit<User, 'password'>) {
    const payload = { 
      sub: user.id, 
      email: user.email,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    };
  }
}
