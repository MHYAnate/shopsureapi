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
import { GoodsService } from './goods.service';
import { CreateGoodsDto } from './dto/create-goods.dto';
import { UpdateGoodsDto } from './dto/update-goods.dto';
import { QueryGoodsDto } from './dto/query-goods.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Role } from '../common/enums/role.enum';
import { User } from '../users/schemas/user.schema';

@Controller('goods')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GoodsController {
  constructor(private readonly goodsService: GoodsService) {}

  @Post()
  @Roles(Role.VENDOR, Role.ADMIN)
  async create(
    @CurrentUser() user: User,
    @Body() createGoodsDto: CreateGoodsDto,
  ) {
    return this.goodsService.create(user._id.toString(), createGoodsDto);
  }

  @Public()
  @Get()
  async findAll(@Query() queryDto: QueryGoodsDto) {
    return this.goodsService.findAll(queryDto, true);
  }

  @Get('admin')
  @Roles(Role.ADMIN)
  async findAllAdmin(@Query() queryDto: QueryGoodsDto) {
    return this.goodsService.findAll(queryDto, false);
  }

  @Get('my-goods')
  @Roles(Role.VENDOR, Role.ADMIN)
  async findMyGoods(
    @CurrentUser() user: User,
    @Query() queryDto: QueryGoodsDto,
  ) {
    const vendor = await this.goodsService.findByVendor(
      user._id.toString(),
      queryDto,
    );
    return vendor;
  }

  @Public()
  @Get('categories')
  async getCategories() {
    return this.goodsService.getCategories();
  }

  @Get('stats')
  @Roles(Role.ADMIN)
  async getStats() {
    return this.goodsService.getStats();
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.goodsService.findOne(id, true);
  }

  @Patch(':id')
  @Roles(Role.VENDOR, Role.ADMIN)
  async update(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() updateGoodsDto: UpdateGoodsDto,
  ) {
    return this.goodsService.update(id, user._id.toString(), updateGoodsDto);
  }

  @Delete(':id')
  @Roles(Role.VENDOR, Role.ADMIN)
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    const isAdmin = user.role === Role.ADMIN;
    await this.goodsService.remove(id, user._id.toString(), isAdmin);
    return { message: 'Goods deleted successfully' };
  }
}