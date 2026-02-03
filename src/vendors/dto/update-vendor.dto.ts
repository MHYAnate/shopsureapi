import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsString, IsBoolean } from 'class-validator';
import { CreateVendorDto } from './create-vendor.dto';
import { VendorStatus } from '../schemas/vendor.schema';

export class UpdateVendorDto extends PartialType(CreateVendorDto) {
  @IsOptional()
  @IsBoolean()
  isOpen?: boolean;
}

export class UpdateVendorStatusDto {
  @IsEnum(VendorStatus)
  status: VendorStatus;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}