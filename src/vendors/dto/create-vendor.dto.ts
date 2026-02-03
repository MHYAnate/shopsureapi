import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  IsEnum,
  IsNumber,
  ValidateNested,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { VendorType } from '../../common/enums/vendor-type.enum';

class CoordinatesDto {
  @IsNumber()
  longitude: number;

  @IsNumber()
  latitude: number;
}

export class CreateVendorDto {
  @IsNotEmpty()
  @IsString()
  businessName: string;

  @IsNotEmpty()
  @IsString()
  businessDescription: string;

  @IsNotEmpty()
  @IsEnum(VendorType)
  vendorType: VendorType;

  // For market/mall vendors
  @ValidateIf((o) => o.vendorType !== VendorType.HOME_BASED && o.vendorType !== VendorType.ONLINE_ONLY)
  @IsNotEmpty()
  @IsString()
  locationId?: string;

  @IsOptional()
  @IsString()
  shopNumber?: string;

  @IsOptional()
  @IsString()
  shopFloor?: string;

  @IsOptional()
  @IsString()
  shopBlock?: string;

  // For home-based vendors
  @ValidateIf((o) => o.vendorType === VendorType.HOME_BASED)
  @IsNotEmpty()
  @IsString()
  homeAddress?: string;

  @ValidateIf((o) => o.vendorType === VendorType.HOME_BASED)
  @IsNotEmpty()
  @IsString()
  homeState?: string;

  @ValidateIf((o) => o.vendorType === VendorType.HOME_BASED)
  @IsNotEmpty()
  @IsString()
  homeLga?: string;

  @ValidateIf((o) => o.vendorType === VendorType.HOME_BASED)
  @IsNotEmpty()
  @IsString()
  homeArea?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates?: CoordinatesDto;

  @IsOptional()
  @IsString()
  businessPhone?: string;

  @IsOptional()
  @IsEmail()
  businessEmail?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documents?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @IsOptional()
  @IsString()
  whatsappNumber?: string;

  @IsOptional()
  @IsString()
  instagramHandle?: string;

  @IsOptional()
  @IsString()
  facebookPage?: string;

  @IsOptional()
  @IsString()
  openingHours?: string;
}