import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../../users/entities/user.entity';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    const createUserDto = {
      name: 'New User',
      email: 'new@example.com',
      password: 'password123',
      role: UserRole.VIEWER,
    };

    const mockRegisterResponse = {
      id: '1',
      name: createUserDto.name,
      email: createUserDto.email,
      role: createUserDto.role,
    };

    it('should successfully register a new user', async () => {
      mockAuthService.register.mockResolvedValue(mockRegisterResponse);

      const result = await controller.register(createUserDto);

      expect(result).toEqual(mockRegisterResponse);
      expect(authService.register).toHaveBeenCalledWith(
        createUserDto.name,
        createUserDto.email,
        createUserDto.password,
        createUserDto.role,
      );
    });

    it('should throw UnauthorizedException when email already exists', async () => {
      mockAuthService.register.mockRejectedValue(
        new UnauthorizedException('Email already exists'),
      );

      await expect(controller.register(createUserDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should register a user with default VIEWER role when not specified', async () => {
      const createUserDtoWithoutRole = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
      };

      mockAuthService.register.mockResolvedValue({
        ...mockRegisterResponse,
        role: UserRole.VIEWER,
      });

      const result = await controller.register(createUserDtoWithoutRole);

      expect(result.role).toBe(UserRole.VIEWER);
      expect(authService.register).toHaveBeenCalledWith(
        createUserDtoWithoutRole.name,
        createUserDtoWithoutRole.email,
        createUserDtoWithoutRole.password,
        undefined,
      );
    });
  });
});
