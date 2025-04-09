import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ResourcesService } from '../services/resources.service';
import { CreateResourceDto } from '../dtos/create-resource.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { ResourceResponseDto } from '../dtos/resource-response.dto';

@ApiTags('resources')
@ApiBearerAuth()
@Controller('topics/:topicId/resources')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Create a new resource for a topic' })
  @ApiParam({ name: 'topicId', description: 'Topic ID' })
  @ApiResponse({
    status: 201,
    description: 'The resource has been successfully created.',
    type: ResourceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 404, description: 'Topic not found.' })
  async create(
    @Param('topicId') topicId: string,
    @Body() createResourceDto: CreateResourceDto,
  ): Promise<ResourceResponseDto> {
    return this.resourcesService.create(topicId, createResourceDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a resource' })
  @ApiParam({ name: 'topicId', description: 'Topic ID' })
  @ApiParam({ name: 'id', description: 'Resource ID' })
  @ApiResponse({
    status: 204,
    description: 'The resource has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Resource not found.' })
  async remove(
    @Param('topicId') topicId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.resourcesService.remove(topicId, id);
  }
}
