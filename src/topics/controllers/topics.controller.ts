import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  OmitType,
} from '@nestjs/swagger';
import { TopicsService } from '../services/topics.service';
import { CreateTopicDto } from '../dtos/create-topic.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { TopicResponseDto } from '../dtos/topic-response.dto';

@ApiTags('topics')
@ApiBearerAuth()
@Controller('topics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Create a new topic' })
  @ApiResponse({
    status: 201,
    description: 'The topic has been successfully created.',
    type: OmitType<TopicResponseDto, 'resources'>,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  async create(
    @Body() createTopicDto: CreateTopicDto,
  ): Promise<Omit<TopicResponseDto, 'resources'>> {
    return this.topicsService.create(createTopicDto);
  }
}
