import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { Topic } from '../entities/topic.entity';
import { TopicVersion } from '../entities/topic-version.entity';
import { CreateTopicDto } from '../dtos/create-topic.dto';
import { Resource } from '../entities/resource.entity';
import { UpdateTopicDto } from '../dtos/update-topic.dto';
import { TopicPathResponseDto } from '../dtos/topic-response.dto';

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

  async findOne(id: string, version?: number) {
    const topic = await this.topicRepository.findOne({ where: { id } });

    if (!topic) {
      throw new NotFoundException(`Topic with ID ${id} not found`);
    }

    const topicVersion = version
      ? await this.topicVersionRepository.findOne({
          where: { topicId: id, version },
        })
      : await this.topicVersionRepository.findOne({
          where: { topicId: id, isLatest: true },
        });

    if (!topicVersion) {
      throw new NotFoundException(
        `Topic version ${version ?? 'latest'} not found`,
      );
    }

    const resources = await this.resourceRepository.find({
      where: { topicId: topic.id },
    });

    return {
      id: topic.id,
      name: topicVersion.name,
      version: topicVersion.version,
      content: topicVersion.content,
      parentId: topic.parentId,
      resources,
    };
  }

  @Transactional()
  async update(id: string, updateTopicDto: UpdateTopicDto) {
    const topic = await this.topicRepository.findOne({ where: { id } });

    if (!topic) {
      throw new NotFoundException(`Topic with ID ${id} not found`);
    }

    const currentLatestVersion = await this.topicVersionRepository.findOne({
      where: { topicId: id, isLatest: true },
    });

    if (!currentLatestVersion) {
      throw new NotFoundException(`Latest version for topic ${id} not found`);
    }

    const newVersion = this.topicVersionRepository.create({
      name: updateTopicDto.name ?? currentLatestVersion.name,
      content: updateTopicDto.content ?? currentLatestVersion.content,
      version: currentLatestVersion.version + 1,
      isLatest: true,
      topicId: id,
    });

    const [savedVersion, resources] = await Promise.all([
      this.topicVersionRepository.save(newVersion),
      this.resourceRepository.find({
        where: { topicId: topic.id },
      }),
      this.topicVersionRepository.update(
        { id: currentLatestVersion.id },
        { isLatest: false },
      ),
    ]);

    return {
      id: topic.id,
      name: savedVersion.name,
      version: savedVersion.version,
      content: savedVersion.content,
      parentId: topic.parentId,
      resources,
    };
  }

  async remove(id: string) {
    const topic = await this.topicRepository.findOne({
      where: { id },
    });

    if (!topic) {
      throw new NotFoundException(`Topic with ID ${id} not found`);
    }

    await this.topicRepository.remove(topic);
  }

  async getTopicTree(topicId: string, version?: number) {
    const topic = await this.topicRepository.findOne({
      where: { id: topicId },
    });

    if (!topic) {
      throw new NotFoundException(`Topic with ID ${topicId} not found`);
    }

    const topicVersion = version
      ? await this.topicVersionRepository.findOne({
          where: { topicId, version },
        })
      : await this.topicVersionRepository.findOne({
          where: { topicId, isLatest: true },
        });

    const resources = await this.resourceRepository.find({
      where: { topicId: topic.id },
    });

    const childTopics = await this.topicRepository.find({
      where: { parentId: topic.id },
    });

    const children = await Promise.all(
      childTopics.map(async (child) => {
        const childVersion = await this.topicVersionRepository.findOne({
          where: { topicId: child.id, isLatest: true },
        });

        const childResources = await this.resourceRepository.find({
          where: { topicId: child.id },
        });

        const grandchildren = await this.getTopicTree(child.id);

        return {
          id: child.id,
          name: childVersion.name,
          version: childVersion.version,
          content: childVersion.content,
          resources: childResources,
          children: grandchildren.children,
        };
      }),
    );

    return {
      id: topic.id,
      name: topicVersion.name,
      version: topicVersion.version,
      content: topicVersion.content,
      resources,
      children,
    };
  }

  private async buildTopicGraph(): Promise<Map<string, string[]>> {
    const graph = new Map<string, string[]>();

    const topics = await this.topicRepository.find();

    for (const topic of topics) {
      const neighbors: string[] = [];

      if (topic.parentId) {
        neighbors.push(topic.parentId);
      }

      const children = await this.topicRepository.find({
        where: { parentId: topic.id },
      });

      neighbors.push(...children.map((child) => child.id));

      graph.set(topic.id, neighbors);
    }

    return graph;
  }

  private findPath(
    graph: Map<string, string[]>,
    start: string,
    end: string,
  ): string[] {
    if (start === end) {
      return [start];
    }

    const queue: { node: string; path: string[] }[] = [
      { node: start, path: [start] },
    ];
    const visited = new Set<string>([start]);

    while (queue.length > 0) {
      const { node, path } = queue.shift()!;
      const neighbors = graph.get(node) || [];

      for (const neighbor of neighbors) {
        if (neighbor === end) {
          return [...path, end];
        }

        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push({
            node: neighbor,
            path: [...path, neighbor],
          });
        }
      }
    }

    return [];
  }

  async findShortestPath(
    startId: string,
    endId: string,
  ): Promise<TopicPathResponseDto> {
    const [start, end] = await Promise.all([
      this.findOne(startId),
      this.findOne(endId),
    ]);

    if (!start || !end) {
      throw new NotFoundException('Start or end topic not found');
    }

    const graph = await this.buildTopicGraph();

    const path = this.findPath(graph, startId, endId);

    if (path.length === 0) {
      throw new UnprocessableEntityException(
        'No path exists between the specified topics',
      );
    }

    const pathDetails = await Promise.all(
      path.map(async (topicId) => {
        const topic = await this.findOne(topicId);
        return {
          id: topic.id,
          name: topic.name,
          version: topic.version,
          content: topic.content,
          resources: topic.resources,
        };
      }),
    );

    return {
      path: pathDetails,
      distance: path.length - 1,
      startTopic: {
        id: start.id,
        name: start.name,
        version: start.version,
        content: start.content,
        resources: start.resources,
      },
      endTopic: {
        id: end.id,
        name: end.name,
        version: end.version,
        content: end.content,
        resources: end.resources,
      },
    };
  }
}
