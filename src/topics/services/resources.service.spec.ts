import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ResourcesService } from './resources.service';
import { Resource, ResourceType } from '../entities/resource.entity';
import { Topic } from '../entities/topic.entity';
import { CreateResourceDto } from '../dtos/create-resource.dto';

jest.mock('uuid');

describe('ResourcesService', () => {
  let service: ResourcesService;
  let resourceRepository: Repository<Resource>;
  let topicRepository: Repository<Topic>;

  const mockUuid = '123e4567-e89b-12d3-a456-426614174000';

  const mockTopic = {
    id: '1',
    parentId: null,
  };

  const mockResource = {
    id: mockUuid,
    url: 'https://example.com',
    description: 'Test Resource',
    type: ResourceType.ARTICLE,
    topic: mockTopic,
  };

  beforeEach(async () => {
    (uuidv4 as jest.Mock).mockReturnValue(mockUuid);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourcesService,
        {
          provide: getRepositoryToken(Resource),
          useValue: {
            create: jest.fn().mockReturnValue(mockResource),
            save: jest.fn().mockResolvedValue(mockResource),
            findOne: jest.fn().mockResolvedValue(mockResource),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Topic),
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockTopic),
          },
        },
      ],
    }).compile();

    service = module.get<ResourcesService>(ResourcesService);
    resourceRepository = module.get<Repository<Resource>>(
      getRepositoryToken(Resource),
    );
    topicRepository = module.get<Repository<Topic>>(getRepositoryToken(Topic));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createResourceDto: CreateResourceDto = {
      url: 'https://example.com',
      description: 'Test Resource',
      type: ResourceType.ARTICLE,
    };

    it('should create a resource', async () => {
      const result = await service.create('1', createResourceDto);
      expect(result).toEqual(mockResource);
      expect(uuidv4).toHaveBeenCalled();
    });

    it('should throw NotFoundException when topic not found', async () => {
      jest.spyOn(topicRepository, 'findOne').mockResolvedValueOnce(null);
      await expect(service.create('999', createResourceDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
