import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Resource } from '../entities/resource.entity';
import { Topic } from '../entities/topic.entity';
import { CreateResourceDto } from '../dtos/create-resource.dto';

@Injectable()
export class ResourcesService {
  constructor(
    @InjectRepository(Resource)
    private resourceRepository: Repository<Resource>,
    @InjectRepository(Topic)
    private topicRepository: Repository<Topic>,
  ) {}

  async create(topicId: string, createResourceDto: CreateResourceDto) {
    const topic = await this.topicRepository.findOne({
      where: { id: topicId },
    });

    if (!topic) {
      throw new NotFoundException(`Topic with ID ${topicId} not found`);
    }

    const resource = this.resourceRepository.create({
      id: uuidv4(),
      ...createResourceDto,
      topic,
    });

    return this.resourceRepository.save(resource);
  }

  async remove(topicId: string, id: string) {
    const resource = await this.resourceRepository.findOne({
      where: { id, topic: { id: topicId } },
      relations: ['topic'],
    });

    if (!resource) {
      throw new NotFoundException(
        `Resource with ID ${id} not found for topic ${topicId}`,
      );
    }

    await this.resourceRepository.remove(resource);
  }
}
