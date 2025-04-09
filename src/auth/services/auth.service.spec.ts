import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from '../../users/entities/user.entity';
import { UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword123',
    role: UserRole.VIEWER,
    createdAt: new Date(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock.jwt.token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const newUser = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
        role: UserRole.VIEWER,
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(() => Promise.resolve('hashedPassword'));
      jest
        .spyOn(userRepository, 'create')
        .mockReturnValue({ ...newUser, id: '1' } as User);
      jest
        .spyOn(userRepository, 'save')
        .mockResolvedValue({ ...newUser, id: '1' } as User);

      const result = await service.register(
        newUser.name,
        newUser.email,
        newUser.password,
        newUser.role,
      );

      expect(result).toEqual({
        id: '1',
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(newUser.password, 10);
    });

    it('should throw UnauthorizedException when email already exists', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

      await expect(
        service.register(
          'New User',
          mockUser.email,
          'password123',
          UserRole.VIEWER,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should use VIEWER role by default when not specified', async () => {
      const newUser = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(() => Promise.resolve('hashedPassword'));
      jest.spyOn(userRepository, 'create').mockReturnValue({
        ...newUser,
        id: '1',
        role: UserRole.VIEWER,
      } as User);
      jest.spyOn(userRepository, 'save').mockResolvedValue({
        ...newUser,
        id: '1',
        role: UserRole.VIEWER,
      } as User);

      const result = await service.register(
        newUser.name,
        newUser.email,
        newUser.password,
      );

      expect(result.role).toBe(UserRole.VIEWER);
    });
  });

  describe('login', () => {
    it('should successfully login a user with valid credentials', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));

      const result = await service.login('test@example.com', 'password123');

      expect(result).toEqual({
        access_token: 'mock.jwt.token',
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        id: mockUser.id,
        role: mockUser.role,
      });
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.login('nonexistent@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false));

      await expect(
        service.login('test@example.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
