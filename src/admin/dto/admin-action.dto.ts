import { IsEnum, IsOptional, IsString } from 'class-validator';
import { GoodsStatus } from '../../common/enums/goods-status.enum';
import { VendorStatus } from '../../vendors/schemas/vendor.schema';

export class UpdateGoodsStatusDto {
  @IsEnum(GoodsStatus)
  status: GoodsStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateVendorStatusDto {
  @IsEnum(VendorStatus)
  status: VendorStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}