import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TopicsService } from './services/topics.service';
import { Topic } from './entities/topic.entity';
import { Resource } from './entities/resource.entity';
import { TopicVersion } from './entities/topic-version.entity';
import { TopicsController } from './controllers/topics.controller';
import { ResourcesController } from './controllers/resources.controller';
import { ResourcesService } from './services/resources.service';

@Module({
  imports: [TypeOrmModule.forFeature([Topic, Resource, TopicVersion])],
  providers: [TopicsService, ResourcesService],
  controllers: [TopicsController, ResourcesController],
})
export class TopicsModule {}
