import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TopicsController } from './topics.controller';
import { TopicsService } from '../services/topics.service';
import { CreateTopicDto } from '../dtos/create-topic.dto';
import { UpdateTopicDto } from '../dtos/update-topic.dto';

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
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getTopicTree: jest.fn(),
  };

  const mockTopicTree = {
    id: '1',
    name: 'Root Topic',
    content: 'Root Content',
    version: 1,
    resources: [],
    children: [
      {
        id: '2',
        name: 'Child Topic',
        content: 'Child Content',
        version: 1,
        resources: [],
        children: [],
      },
    ],
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

  describe('findOne', () => {
    it('should return a topic by id', async () => {
      mockTopicsService.findOne.mockResolvedValue(mockTopic);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockTopic);
      expect(topicsService.findOne).toHaveBeenCalledWith('1', undefined);
    });

    it('should return a topic by id and version', async () => {
      mockTopicsService.findOne.mockResolvedValue({ ...mockTopic, version: 2 });

      const result = await controller.findOne('1', 2);

      expect(result).toEqual({ ...mockTopic, version: 2 });
      expect(topicsService.findOne).toHaveBeenCalledWith('1', 2);
    });

    it('should throw NotFoundException when topic is not found', async () => {
      mockTopicsService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateTopicDto: UpdateTopicDto = {
      name: 'Updated Topic',
      content: 'Updated Content',
    };

    it('should update a topic', async () => {
      mockTopicsService.update.mockResolvedValue({
        ...mockTopic,
        ...updateTopicDto,
      });

      const result = await controller.update('1', updateTopicDto);

      expect(result).toEqual({ ...mockTopic, ...updateTopicDto });
      expect(topicsService.update).toHaveBeenCalledWith('1', updateTopicDto);
    });

    it('should throw NotFoundException when topic to update is not found', async () => {
      mockTopicsService.update.mockRejectedValue(new NotFoundException());

      await expect(controller.update('999', updateTopicDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a topic', async () => {
      mockTopicsService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(topicsService.remove).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when topic to remove is not found', async () => {
      mockTopicsService.remove.mockRejectedValue(new NotFoundException());

      await expect(controller.remove('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getTopicTree', () => {
    it('should return a topic tree', async () => {
      mockTopicsService.getTopicTree.mockResolvedValue(mockTopicTree);

      const result = await controller.getTopicTree('1');

      expect(result).toEqual(mockTopicTree);
      expect(topicsService.getTopicTree).toHaveBeenCalledWith('1', undefined);
    });

    it('should return a topic tree for specific version', async () => {
      mockTopicsService.getTopicTree.mockResolvedValue({
        ...mockTopicTree,
        version: 2,
      });

      const result = await controller.getTopicTree('1', 2);

      expect(result).toEqual({ ...mockTopicTree, version: 2 });
      expect(topicsService.getTopicTree).toHaveBeenCalledWith('1', 2);
    });

    it('should throw NotFoundException when root topic is not found', async () => {
      mockTopicsService.getTopicTree.mockRejectedValue(new NotFoundException());

      await expect(controller.getTopicTree('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
