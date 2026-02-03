import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';
import { User } from '../users/schemas/user.schema';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('vendors/pending')
  async getPendingVendors(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.adminService.getPendingVendors(page, limit);
  }

  @Patch('vendors/:id/verify')
  async verifyVendor(@Param('id') id: string, @CurrentUser() user: User) {
    return this.adminService.verifyVendor(id, user._id.toString());
  }

  @Patch('vendors/:id/reject')
  async rejectVendor(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body('reason') reason: string,
  ) {
    return this.adminService.rejectVendor(id, user._id.toString(), reason);
  }

  @Patch('vendors/:id/suspend')
  async suspendVendor(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body('reason') reason: string,
  ) {
    return this.adminService.suspendVendor(id, user._id.toString(), reason);
  }

  @Get('goods/pending')
  async getPendingGoods(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.adminService.getPendingGoods(page, limit);
  }

  @Patch('goods/:id/approve')
  async approveGoods(@Param('id') id: string, @CurrentUser() user: User) {
    return this.adminService.approveGoods(id, user._id.toString());
  }

  @Patch('goods/:id/flag')
  async flagGoods(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body('reason') reason: string,
  ) {
    return this.adminService.flagGoods(id, user._id.toString(), reason);
  }

  @Patch('goods/:id/drop')
  async dropGoods(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body('reason') reason: string,
  ) {
    return this.adminService.dropGoods(id, user._id.toString(), reason);
  }
}