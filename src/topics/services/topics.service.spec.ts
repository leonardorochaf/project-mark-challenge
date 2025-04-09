import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { TopicsService } from './topics.service';
import { Topic } from '../entities/topic.entity';
import { TopicVersion } from '../entities/topic-version.entity';
import { CreateTopicDto } from '../dtos/create-topic.dto';
import { Resource, ResourceType } from '../entities/resource.entity';

jest.mock('typeorm-transactional', () => ({
  Transactional: () => () => {},
  initializeTransactionalContext: () => {},
}));

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('TopicsService', () => {
  let service: TopicsService;
  let topicRepository: Repository<Topic>;
  let topicVersionRepository: Repository<TopicVersion>;

  const mockUuid = '123e4567-e89b-12d3-a456-426614174000';

  const mockTopic = {
    id: '1',
    parentId: null,
    createdAt: new Date(),
    parent: null,
    children: [],
    versions: [],
    resources: [],
  };

  const mockTopicVersion = {
    id: '1',
    version: 1,
    name: 'Test Topic',
    content: 'Test Content',
    isLatest: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    topicId: '1',
    topic: mockTopic,
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
        TopicsService,
        {
          provide: getRepositoryToken(Topic),
          useValue: {
            create: jest.fn().mockReturnValue(mockTopic),
            save: jest.fn().mockResolvedValue(mockTopic),
            findOne: jest.fn().mockImplementation(async (options: any) => {
              const id = options.where?.id;
              if (id === '1') return mockTopic;
              if (id === '2') return { ...mockTopic, id: '2', parentId: '1' };
              if (id === '3') return { ...mockTopic, id: '3', parentId: '2' };
              if (id === '4') return { ...mockTopic, id: '4', parentId: '2' };
              if (id === '999')
                return { ...mockTopic, id: '999', parentId: null };
              return null;
            }),
            find: jest.fn().mockImplementation(async (options: any) => {
              if (!options)
                return [
                  mockTopic,
                  { ...mockTopic, id: '2', parentId: '1' },
                  { ...mockTopic, id: '3', parentId: '2' },
                  { ...mockTopic, id: '4', parentId: '2' },
                ];
              const parentId = options.where?.parentId;
              if (parentId === null) return [mockTopic];
              if (parentId === '1')
                return [{ ...mockTopic, id: '2', parentId: '1' }];
              if (parentId === '2')
                return [
                  { ...mockTopic, id: '3', parentId: '2' },
                  { ...mockTopic, id: '4', parentId: '2' },
                ];
              return [];
            }),
          },
        },
        {
          provide: getRepositoryToken(TopicVersion),
          useValue: {
            create: jest.fn().mockReturnValue(mockTopicVersion),
            save: jest.fn().mockResolvedValue(mockTopicVersion),
            findOne: jest.fn().mockImplementation(async (options: any) => {
              const topicId = options.where?.topicId;
              if (topicId === '1') return mockTopicVersion;
              if (topicId === '2')
                return { ...mockTopicVersion, id: '2', topicId: '2' };
              if (topicId === '3')
                return { ...mockTopicVersion, id: '3', topicId: '3' };
              if (topicId === '4')
                return { ...mockTopicVersion, id: '4', topicId: '4' };
              if (topicId === '999')
                return { ...mockTopicVersion, id: '999', topicId: '999' };
              return null;
            }),
          },
        },
        {
          provide: getRepositoryToken(Resource),
          useValue: {
            find: jest.fn().mockResolvedValue([mockResource]),
          },
        },
      ],
    }).compile();

    service = module.get<TopicsService>(TopicsService);
    topicRepository = module.get<Repository<Topic>>(getRepositoryToken(Topic));
    topicVersionRepository = module.get<Repository<TopicVersion>>(
      getRepositoryToken(TopicVersion),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createTopicDto: CreateTopicDto = {
      name: 'Test Topic',
      content: 'Test Content',
    };

    it('should create a topic without parent', async () => {
      const result = await service.create(createTopicDto);
      expect(result).toEqual({
        id: mockTopic.id,
        name: mockTopicVersion.name,
        version: mockTopicVersion.version,
        content: mockTopicVersion.content,
        parentId: null,
      });
    });

    it('should create a topic with parent', async () => {
      const dtoWithParent = { ...createTopicDto, parentId: '2' };
      const result = await service.create(dtoWithParent);
      expect(result.parentId).toBeDefined();
    });

    it('should throw NotFoundException when parent topic not found', async () => {
      jest.spyOn(topicRepository, 'findOne').mockResolvedValueOnce(null);

      const dtoWithParent = { ...createTopicDto, parentId: '999' };
      await expect(service.create(dtoWithParent)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of topics', async () => {
      const result = await service.findAll();
      expect(result).toEqual([
        {
          id: mockTopic.id,
          name: mockTopicVersion.name,
          version: mockTopicVersion.version,
          content: mockTopicVersion.content,
          parentId: null,
          resources: [mockResource],
        },
      ]);
    });
  });

  describe('findOne', () => {
    it('should return a topic', async () => {
      const result = await service.findOne('1');
      expect(result).toEqual({
        id: mockTopic.id,
        name: mockTopicVersion.name,
        version: mockTopicVersion.version,
        content: mockTopicVersion.content,
        parentId: null,
        resources: [mockResource],
      });
    });

    it('should throw NotFoundException when topic not found', async () => {
      jest.spyOn(topicRepository, 'findOne').mockResolvedValueOnce(null);
      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when version not found', async () => {
      jest.spyOn(topicVersionRepository, 'findOne').mockResolvedValueOnce(null);
      await expect(service.findOne('1', 999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
