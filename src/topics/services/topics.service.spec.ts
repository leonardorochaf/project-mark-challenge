import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TopicsService } from './topics.service';
import { Topic } from '../entities/topic.entity';
import { TopicVersion } from '../entities/topic-version.entity';
import { CreateTopicDto } from '../dtos/create-topic.dto';

jest.mock('typeorm-transactional', () => ({
  Transactional: () => () => {},
  initializeTransactionalContext: () => {},
}));

describe('TopicsService', () => {
  let service: TopicsService;
  let topicRepository: Repository<Topic>;
  let topicVersionRepository: Repository<TopicVersion>;

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

  beforeEach(async () => {
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
          },
        },
        {
          provide: getRepositoryToken(TopicVersion),
          useValue: {
            create: jest.fn().mockReturnValue(mockTopicVersion),
            save: jest.fn().mockResolvedValue(mockTopicVersion),
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
});
