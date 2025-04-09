import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ResourceResponseDto } from './resource-response.dto';

export class TopicResponseDto {
  @ApiProperty({
    description: 'Topic ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Topic name',
    example: 'Introduction to TypeScript',
  })
  name: string;

  @ApiProperty({
    description: 'Topic version number',
    example: 1,
  })
  version: number;

  @ApiProperty({
    description: 'Topic content',
    example: 'TypeScript is a typed superset of JavaScript...',
  })
  content: string;

  @ApiPropertyOptional({
    description: 'ID of the parent topic',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  parentId?: string;

  @ApiProperty({
    description: 'List of resources associated with this topic',
    type: [ResourceResponseDto],
  })
  resources: ResourceResponseDto[];
}
