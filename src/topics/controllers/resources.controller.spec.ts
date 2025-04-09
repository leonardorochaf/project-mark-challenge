import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ResourcesController } from './resources.controller';
import { ResourcesService } from '../services/resources.service';
import { CreateResourceDto } from '../dtos/create-resource.dto';
import { ResourceType } from '../entities/resource.entity';

describe('ResourcesController', () => {
  let controller: ResourcesController;
  let resourcesService: ResourcesService;

  const mockResource = {
    id: '1',
    url: 'https://example.com',
    description: 'Test Resource Description',
    type: ResourceType.ARTICLE,
    topicId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockResourcesService = {
    create: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResourcesController],
      providers: [
        {
          provide: ResourcesService,
          useValue: mockResourcesService,
        },
      ],
    }).compile();

    controller = module.get<ResourcesController>(ResourcesController);
    resourcesService = module.get<ResourcesService>(ResourcesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createResourceDto: CreateResourceDto = {
      url: 'https://example.com/new',
      description: 'New Resource Description',
      type: ResourceType.ARTICLE,
    };

    it('should create a new resource', async () => {
      mockResourcesService.create.mockResolvedValue({
        ...mockResource,
        ...createResourceDto,
      });

      const result = await controller.create('1', createResourceDto);

      expect(result).toEqual({ ...mockResource, ...createResourceDto });
      expect(resourcesService.create).toHaveBeenCalledWith(
        '1',
        createResourceDto,
      );
    });

    it('should throw NotFoundException when topic is not found', async () => {
      mockResourcesService.create.mockRejectedValue(
        new NotFoundException('Topic not found'),
      );

      await expect(controller.create('999', createResourceDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
