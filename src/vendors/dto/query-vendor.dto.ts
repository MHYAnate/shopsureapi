import {
  IsOptional,
  IsNumber,
  IsEnum,
  IsString,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { VendorType } from '../../common/enums/vendor-type.enum';
import { VendorStatus } from '../schemas/vendor.schema';

export class QueryVendorDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(VendorStatus)
  status?: VendorStatus;

  @IsOptional()
  @IsEnum(VendorType)
  vendorType?: VendorType;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  lga?: string;

  @IsOptional()
  @IsString()
  area?: string;

  @IsOptional()
  @IsString()
  locationId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  radiusKm?: number = 10;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isOpen?: boolean;
}