import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Query,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
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
import {
  TopicPathResponseDto,
  TopicResponseDto,
  TopicTreeResponseDto,
} from '../dtos/topic-response.dto';
import { UpdateTopicDto } from '../dtos/update-topic.dto';

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

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Update a topic' })
  @ApiParam({ name: 'id', description: 'Topic ID' })
  @ApiResponse({
    status: 200,
    description: 'The topic has been successfully updated.',
    type: TopicResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Topic not found.' })
  async update(
    @Param('id') id: string,
    @Body() updateTopicDto: UpdateTopicDto,
  ): Promise<TopicResponseDto> {
    return this.topicsService.update(id, updateTopicDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a topic' })
  @ApiParam({ name: 'id', description: 'Topic ID' })
  @ApiResponse({
    status: 204,
    description: 'The topic has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Topic not found.' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.topicsService.remove(id);
  }

  @Get(':id/tree')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Get topic tree' })
  @ApiParam({ name: 'id', description: 'Root topic ID' })
  @ApiQuery({
    name: 'version',
    required: false,
    description: 'Specific version of the topic',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'The topic tree has been retrieved.',
    type: TopicTreeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Topic not found.' })
  async getTopicTree(
    @Param('id') id: string,
    @Query('version') version?: number,
  ): Promise<TopicTreeResponseDto> {
    return this.topicsService.getTopicTree(id, version);
  }

  @Get(':startId/path/:endId')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Find shortest path between two topics' })
  @ApiParam({ name: 'startId', description: 'Starting topic ID' })
  @ApiParam({ name: 'endId', description: 'Ending topic ID' })
  @ApiResponse({
    status: 200,
    description: 'The shortest path has been found.',
    type: TopicPathResponseDto,
  })
  @ApiResponse({ status: 404, description: 'One or both topics not found.' })
  @ApiResponse({
    status: 422,
    description: 'No path exists between the specified topics.',
  })
  async findShortestPath(
    @Param('startId') startId: string,
    @Param('endId') endId: string,
  ): Promise<TopicPathResponseDto> {
    return this.topicsService.findShortestPath(startId, endId);
  }
}
