import { IsEnum, IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ResourceType } from '../entities/resource.entity';

export class CreateResourceDto {
  @ApiProperty({ description: 'The URL of the resource' })
  @IsNotEmpty()
  @IsUrl()
  url: string;

  @ApiProperty({ description: 'A description of the resource' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'The type of resource',
    enum: ResourceType,
    example: ResourceType.ARTICLE,
  })
  @IsNotEmpty()
  @IsEnum(ResourceType)
  type: ResourceType;
}
