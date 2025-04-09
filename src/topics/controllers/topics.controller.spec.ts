import { Test, TestingModule } from '@nestjs/testing';
import { TopicsController } from './topics.controller';
import { TopicsService } from '../services/topics.service';
import { CreateTopicDto } from '../dtos/create-topic.dto';

describe('TopicsController', () => {
  let controller: TopicsController;
  let topicsService: TopicsService;

  const mockTopic = {
    id: '1',
    name: 'Test Topic',
    content: 'Test Content',
    version: 1,
    parentId: null,
    resources: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTopicsService = {
    create: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TopicsController],
      providers: [
        {
          provide: TopicsService,
          useValue: mockTopicsService,
        },
      ],
    }).compile();

    controller = module.get<TopicsController>(TopicsController);
    topicsService = module.get<TopicsService>(TopicsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createTopicDto: CreateTopicDto = {
      name: 'New Topic',
      content: 'New Content',
      parentId: null,
    };

    it('should create a new topic', async () => {
      mockTopicsService.create.mockResolvedValue({
        ...mockTopic,
        ...createTopicDto,
      });

      const result = await controller.create(createTopicDto);

      expect(result).toEqual({ ...mockTopic, ...createTopicDto });
      expect(topicsService.create).toHaveBeenCalledWith(createTopicDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of topics', async () => {
      mockTopicsService.findAll.mockResolvedValue([mockTopic]);

      const result = await controller.findAll();

      expect(result).toEqual([mockTopic]);
      expect(topicsService.findAll).toHaveBeenCalled();
    });
  });
});
