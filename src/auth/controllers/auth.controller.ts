import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { RegisterResponseDto } from '../dtos/register-response.dto';
import { LoginDto } from '../dtos/login.dto';
import { LoginResponseDto } from '../dtos/login-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered.',
    type: RegisterResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 409, description: 'Email already exists.' })
  async register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<RegisterResponseDto> {
    return this.authService.register(
      createUserDto.name,
      createUserDto.email,
      createUserDto.password,
      createUserDto.role,
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in.',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto.email, loginDto.password);
  }
}
