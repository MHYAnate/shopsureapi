import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto, UpdateVendorStatusDto } from './dto/update-vendor.dto';
import { QueryVendorDto } from './dto/query-vendor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Role } from '../common/enums/role.enum';
import { User } from '../users/schemas/user.schema';

@Controller('vendors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() createVendorDto: CreateVendorDto,
  ) {
    return this.vendorsService.create(user._id.toString(), createVendorDto);
  }

  @Public()
  @Get()
  async findAll(@Query() queryDto: QueryVendorDto) {
    return this.vendorsService.findAll(queryDto, true);
  }

  @Get('admin')
  @Roles(Role.ADMIN)
  async findAllAdmin(@Query() queryDto: QueryVendorDto) {
    return this.vendorsService.findAll(queryDto, false);
  }

  @Get('my-profile')
  async getMyProfile(@CurrentUser() user: User) {
    return this.vendorsService.findByUserId(user._id.toString());
  }

  @Public()
  @Get('categories')
  async getCategories() {
    return this.vendorsService.getCategories();
  }

  @Public()
  @Get('nearby')
  async findNearby(
    @Query('longitude') longitude: number,
    @Query('latitude') latitude: number,
    @Query('radius') radius: number = 10,
  ) {
    return this.vendorsService.findNearby(longitude, latitude, radius);
  }

  @Public()
  @Get('by-location/:locationId')
  async findByLocation(@Param('locationId') locationId: string) {
    return this.vendorsService.findByLocation(locationId);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.vendorsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() updateVendorDto: UpdateVendorDto,
  ) {
    return this.vendorsService.update(id, user._id.toString(), updateVendorDto);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() updateStatusDto: UpdateVendorStatusDto,
  ) {
    return this.vendorsService.updateStatus(
      id,
      user._id.toString(),
      updateStatusDto,
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.vendorsService.remove(id, user._id.toString());
    return { message: 'Vendor profile deleted successfully' };
  }
}