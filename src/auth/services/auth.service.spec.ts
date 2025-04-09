import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from '../../users/entities/user.entity';
import { UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;

  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword123',
    role: UserRole.VIEWER,
    createdAt: new Date(),
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
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
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
});
