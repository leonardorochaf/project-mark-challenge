import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { Topic } from '../entities/topic.entity';
import { TopicVersion } from '../entities/topic-version.entity';
import { CreateTopicDto } from '../dtos/create-topic.dto';
import { Resource } from '../entities/resource.entity';

@Injectable()
export class TopicsService {
  constructor(
    @InjectRepository(Topic)
    private topicRepository: Repository<Topic>,
    @InjectRepository(TopicVersion)
    private topicVersionRepository: Repository<TopicVersion>,
    @InjectRepository(Resource)
    private resourceRepository: Repository<Resource>,
  ) {}

  @Transactional()
  async create(createTopicDto: CreateTopicDto) {
    const topic = this.topicRepository.create();

    if (createTopicDto.parentId) {
      const parentTopic = await this.topicRepository.findOne({
        where: { id: createTopicDto.parentId },
      });

      if (!parentTopic) {
        throw new NotFoundException(
          `Parent topic with ID ${createTopicDto.parentId} not found`,
        );
      }

      topic.parent = parentTopic;
    }

    const savedTopic = await this.topicRepository.save(topic);

    const topicVersion = this.topicVersionRepository.create({
      name: createTopicDto.name,
      content: createTopicDto.content,
      version: 1,
      isLatest: true,
      topicId: savedTopic.id,
    });

    const savedVersion = await this.topicVersionRepository.save(topicVersion);

    return {
      id: savedTopic.id,
      name: savedVersion.name,
      version: savedVersion.version,
      content: savedVersion.content,
      parentId: savedTopic.parentId,
    };
  }

  async findAll() {
    const topics = await this.topicRepository.find({
      where: { parentId: null },
    });

    return await Promise.all(
      topics.map(async (topic) => {
        const version = await this.topicVersionRepository.findOne({
          where: { topicId: topic.id, isLatest: true },
        });

        const resources = await this.resourceRepository.find({
          where: { topicId: topic.id },
        });

        return {
          id: topic.id,
          name: version.name,
          version: version.version,
          content: version.content,
          parentId: topic.parentId,
          resources,
        };
      }),
    );
  }
}
