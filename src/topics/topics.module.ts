import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TopicsService } from './services/topics.service';
import { Topic } from './entities/topic.entity';
import { Resource } from './entities/resource.entity';
import { TopicVersion } from './entities/topic-version.entity';
import { TopicsController } from './controllers/topics.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Topic, Resource, TopicVersion])],
  providers: [TopicsService],
  controllers: [TopicsController],
})
export class TopicsModule {}
