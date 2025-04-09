import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  OmitType,
  ApiParam,
  ApiQuery,
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

  @Get()
  @ApiOperation({ summary: 'Get all root topics' })
  @ApiResponse({
    status: 200,
    description: 'List of all root topics.',
    type: [TopicResponseDto],
  })
  async findAll(): Promise<TopicResponseDto[]> {
    return this.topicsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific topic' })
  @ApiParam({ name: 'id', description: 'Topic ID' })
  @ApiQuery({
    name: 'version',
    required: false,
    description: 'Specific version of the topic',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'The topic has been found.',
    type: TopicResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Topic not found.' })
  async findOne(
    @Param('id') id: string,
    @Query('version') version?: number,
  ): Promise<TopicResponseDto> {
    return this.topicsService.findOne(id, version);
  }
}
