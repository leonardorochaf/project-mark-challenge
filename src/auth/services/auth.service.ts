import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { compare, hash } from 'bcryptjs';
import { User, UserRole } from '../../users/entities/user.entity';
import { RegisterResponseDto } from '../dtos/register-response.dto';
import { LoginResponseDto } from '../dtos/login-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(
    name: string,
    email: string,
    password: string,
    role: UserRole = UserRole.VIEWER,
  ): Promise<RegisterResponseDto> {
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new UnauthorizedException('Email already exists');
    }

    const hashedPassword = await hash(password, 10);
    const user = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await this.userRepository.save(user);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  async login(email: string, password: string): Promise<LoginResponseDto> {
    const user = await this.userRepository.findOne({ where: { email } });

    const isPasswordValid = user && (await compare(password, user.password));

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, id: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
