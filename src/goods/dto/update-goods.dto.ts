import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateGoodsDto } from './create-goods.dto';

export class UpdateGoodsDto extends PartialType(CreateGoodsDto) {
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}