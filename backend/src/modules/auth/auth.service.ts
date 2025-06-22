import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { User, AuthProvider, UserRole } from '../../entities/user.entity';
import { Session } from '../../entities/session.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { EmailService } from '../../shared/services/email.service';
import { ActivityLogService } from '../../shared/services/activity-log.service';
import { ActivityType } from '../../entities/activity-log.entity';
import { RedisService } from '../../shared/services/redis.service';

export interface AuthResponse {
  user: Partial<User>;
  accessToken: string;
  refreshToken: string;
}

export interface GoogleProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    private activityLogService: ActivityLogService,
    private redisService: RedisService,
  ) {}

  async register(registerDto: RegisterDto, ipAddress: string, userAgent: string): Promise<{ message: string }> {
    const { email, password, name, bio } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Generate verification token
    const verificationToken = uuidv4();
    
    // Store registration data temporarily in Redis with expiration
    await this.redisService.setex(
      `registration:${verificationToken}`,
      3600, // 1 hour expiration
      JSON.stringify({
        email,
        password,
        name,
        bio,
        ipAddress,
        userAgent,
        timestamp: new Date().toISOString()
      })
    );

    // Send verification email
    await this.emailService.sendVerificationEmail(email, name, verificationToken);

    return { message: 'Please check your email to verify your account.' };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    try {
      // Get registration data from Redis
      const registrationData = await this.redisService.get(`registration:${token}`);
      if (!registrationData) {
        throw new BadRequestException('Invalid or expired verification token');
      }

      const { email, password, name, bio, ipAddress, userAgent } = JSON.parse(registrationData);

      // Check if user already exists
      const existingUser = await this.userRepository.findOne({ where: { email } });
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user after verification
      const user = this.userRepository.create({
        email,
        password: hashedPassword,
        name,
        bio,
        emailVerified: true,
        provider: AuthProvider.LOCAL,
        role: UserRole.USER,
      });

      await this.userRepository.save(user);

      // Log activity
      await this.activityLogService.log({
        userId: user.id,
        type: ActivityType.PROFILE_UPDATE,
        description: 'User verified and registered',
        ipAddress,
        userAgent,
        resourceType: 'user',
        resourceId: user.id,
      });

      // Delete registration data from Redis
      await this.redisService.del(`registration:${token}`);

      return { message: 'Email verified successfully. You can now login.' };

    } catch (error) {
      // Delete registration data from Redis in case of error
      await this.redisService.del(`registration:${token}`);
      throw error;
    }
  }

  async login(loginDto: LoginDto, ipAddress: string, userAgent: string): Promise<AuthResponse> {
    const { email, password, rememberMe } = loginDto;

    // Find user
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException('Account is temporarily locked. Please try again later.');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Increment login attempts
      await this.handleFailedLogin(user);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if email is verified
    if (!user.emailVerified) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    // Check if user is active
    if (!user.active) {
      throw new UnauthorizedException('Your account has been deactivated');
    }

    // Reset login attempts
    await this.userRepository.update(user.id, {
      loginAttempts: 0,
      lockedUntil: undefined,
      lastLogin: new Date(),
    });

    // Generate tokens
    const tokens = await this.generateTokens(user, rememberMe);

    // Create session
    await this.createSession(user.id, tokens.accessToken, tokens.refreshToken, ipAddress, userAgent, rememberMe);

    // Log activity
    await this.activityLogService.log({
      userId: user.id,
      type: ActivityType.LOGIN,
      description: 'User logged in',
      ipAddress,
      userAgent,
    });

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async loginWithGoogle(profile: GoogleProfile, ipAddress: string, userAgent: string): Promise<AuthResponse> {
    let user = await this.userRepository.findOne({
      where: [
        { email: profile.email },
        { providerId: profile.id, provider: AuthProvider.GOOGLE },
      ],
    });

    if (!user) {
      // Create new user
      user = this.userRepository.create({
        email: profile.email,
        name: profile.name,
        avatar: profile.picture,
        provider: AuthProvider.GOOGLE,
        providerId: profile.id,
        emailVerified: true,
        role: UserRole.USER,
      });
      await this.userRepository.save(user);

      // Log activity
      await this.activityLogService.log({
        userId: user.id,
        type: ActivityType.PROFILE_UPDATE,
        description: 'User registered via Google',
        ipAddress,
        userAgent,
        resourceType: 'user',
        resourceId: user.id,
      });
    } else {
      // Update last login
      await this.userRepository.update(user.id, { lastLogin: new Date() });
    }

    // Generate tokens
    const tokens = await this.generateTokens(user, false);

    // Create session
    await this.createSession(user.id, tokens.accessToken, tokens.refreshToken, ipAddress, userAgent, false);

    // Log activity
    await this.activityLogService.log({
      userId: user.id,
      type: ActivityType.LOGIN,
      description: 'User logged in via Google',
      ipAddress,
      userAgent,
    });

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async forgotPassword(email: string, ipAddress: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if email exists
      return { message: 'If the email exists, a password reset link has been sent.' };
    }

    // Generate reset token
    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await this.userRepository.update(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    });

    // Send reset email
    await this.emailService.sendPasswordResetEmail(email, user.name, resetToken);

    // Log activity
    await this.activityLogService.log({
      userId: user.id,
      type: ActivityType.PASSWORD_RESET,
      description: 'Password reset requested',
      ipAddress,
      userAgent: 'Password reset',
    });

    return { message: 'If the email exists, a password reset link has been sent.' };
  }

  async resetPassword(token: string, ipAddress: string): Promise<{ newPassword: string }> {
    const user = await this.userRepository.findOne({
      where: {
        passwordResetToken: token,
      },
    });

    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const newPassword = `${Math.random().toString(36).substring(2, 15)}_QBlog1`;

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.userRepository.update(user.id, {
      password: hashedPassword,
      passwordResetToken: undefined,
      passwordResetExpires: undefined,
    });

    // Invalidate all sessions
    await this.sessionRepository.update(
      { userId: user.id },
      { active: false },
    );

    // Log activity
    await this.activityLogService.log({
      userId: user.id,
      type: ActivityType.PASSWORD_CHANGE,
      description: 'Password reset completed',
      ipAddress,
      userAgent: 'Password reset',
    });

    return { newPassword: newPassword };
  }

  async changePassword(changePasswordDto: any, userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
        throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(changePasswordDto.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid old password');
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await this.userRepository.update(userId, { password: hashedPassword });
    return { message: 'Password updated successfully' };
}

  async logout(userId: string, token: string, ipAddress: string, userAgent: string): Promise<{ message: string }> {
    await this.sessionRepository.update(
      { userId, token },
      { active: false },
    );

    // Log activity
    await this.activityLogService.log({
      userId,
      type: ActivityType.LOGOUT,
      description: 'User logged out',
      ipAddress,
      userAgent,
    });

    return { message: 'Logged out successfully' };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const session = await this.sessionRepository.findOne({
      where: { refreshToken, active: true },
      
    });

    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const payload = { sub: session.userId, email: session.userId };
    const accessToken = this.jwtService.sign(payload);

    // Update session activity
    await this.sessionRepository.update(session.id, {
      lastActivity: new Date(),
    });

    return { accessToken };
  }

  private async generateTokens(user: User, rememberMe = false): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { 
      sub: user.id, 
      email: user.email,
      role: user.role 
    };
    
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: rememberMe ? process.env.JWT_REFRESH_EXPIRATION_TIME : '30d',
    });

    return { accessToken, refreshToken };
  }

  private async createSession(
    userId: string,
    token: string,
    refreshToken: string,
    ipAddress: string,
    userAgent: string,
    rememberMe = false,
  ): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (rememberMe ? 30 : 7));

    const session = this.sessionRepository.create({
      userId,
      token,
      refreshToken,
      expiresAt,
      ipAddress,
      userAgent,
      lastActivity: new Date(),
    });

    await this.sessionRepository.save(session);
  }

  private async handleFailedLogin(user: User): Promise<void> {
    const attempts = user.loginAttempts + 1;
    let lockedUntil: Date | undefined = undefined;

    if (attempts >= 7) {
      lockedUntil = new Date(Date.now() + 10 * 60 * 1000);
    }

    await this.userRepository.update(user.id, {
      loginAttempts: attempts,
      lockedUntil,
    });
  }

  private sanitizeUser(user: User): Partial<User> {
    const { password, passwordResetToken, emailVerificationToken, twoFactorSecret, ...sanitized } = user;
    return sanitized;
  }

  async validateUser(payload: any): Promise<User> {
    const user = await this.userRepository.findOne({ 
      where: { 
        id: payload.sub,
        active: true,
        emailVerified: true
      } 
    });
    
    if (!user) {
      throw new UnauthorizedException('Invalid token or user not found');
    }
    return user;
  }
} 