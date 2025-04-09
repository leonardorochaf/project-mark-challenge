import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTopicDto {
  @ApiProperty({ description: 'The name of the topic' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'The content of the topic' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: 'The ID of the parent topic (if any)' })
  @IsOptional()
  @IsString()
  parentId?: string;
}
