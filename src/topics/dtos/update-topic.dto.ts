import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTopicDto {
  @ApiPropertyOptional({ description: 'The updated name of the topic' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'The updated content of the topic' })
  @IsOptional()
  @IsString()
  content?: string;
}
