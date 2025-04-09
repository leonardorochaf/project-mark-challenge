import { ApiProperty } from '@nestjs/swagger';
import { ResourceType } from '../entities/resource.entity';

export class ResourceResponseDto {
  @ApiProperty({
    description: 'Resource ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Resource URL',
    example: 'https://example.com/resource',
  })
  url: string;

  @ApiProperty({
    description: 'Resource description',
    example: 'A helpful article about TypeScript',
  })
  description: string;

  @ApiProperty({
    description: 'Resource type',
    enum: ResourceType,
    example: ResourceType.ARTICLE,
  })
  type: ResourceType;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-04-08T23:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-04-08T23:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'ID of the topic this resource belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  topicId: string;
}
