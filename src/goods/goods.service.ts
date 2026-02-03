import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Goods, GoodsDocument } from './schemas/goods.schema';
import { CreateGoodsDto } from './dto/create-goods.dto';
import { UpdateGoodsDto } from './dto/update-goods.dto';
import { QueryGoodsDto } from './dto/query-goods.dto';
import { VendorsService } from '../vendors/vendors.service';
import { GoodsStatus } from '../common/enums/goods-status.enum';
import { VendorStatus } from '../vendors/schemas/vendor.schema';

@Injectable()
export class GoodsService {
  constructor(
    @InjectModel(Goods.name) private goodsModel: Model<GoodsDocument>,
    private vendorsService: VendorsService,
  ) {}

  async create(userId: string, createGoodsDto: CreateGoodsDto): Promise<Goods> {
    const vendor = await this.vendorsService.findByUserId(userId);

    if (!vendor) {
      throw new ForbiddenException('You must be a vendor to create goods');
    }

    if (vendor.status !== VendorStatus.VERIFIED) {
      throw new ForbiddenException('Your vendor profile must be verified to create goods');
    }

    const goods = new this.goodsModel({
      ...createGoodsDto,
      vendor: vendor._id,
      createdBy: userId,
    });

    await goods.save();
    await this.vendorsService.incrementGoodsCount(vendor._id.toString());

    return goods.populate(['vendor', 'createdBy']);
  }

  async findAll(
    queryDto: QueryGoodsDto,
    publicOnly: boolean = false,
  ): Promise<{ goods: Goods[]; total: number; pages: number }> {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      category,
      search,
      minPrice,
      maxPrice,
      vendorId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      condition,
      brand,
    } = queryDto;

    const query: any = {};

    if (publicOnly) {
      query.status = GoodsStatus.APPROVED;
      query.isAvailable = true;
    } else if (status) {
      query.status = status;
    }

    if (type) {
      query.type = type;
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) {
        query.price.$gte = minPrice;
      }
      if (maxPrice !== undefined) {
        query.price.$lte = maxPrice;
      }
    }

    if (vendorId) {
      query.vendor = vendorId;
    }

    if (condition) {
      query.condition = condition;
    }

    if (brand) {
      query.brand = { $regex: new RegExp(brand, 'i') };
    }

    const skip = (page - 1) * limit;
    const sort: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [goods, total] = await Promise.all([
      this.goodsModel
        .find(query)
        .populate({
          path: 'vendor',
          populate: { path: 'location' },
        })
        .populate('createdBy', '-password')
        .skip(skip)
        .limit(limit)
        .sort(sort),
      this.goodsModel.countDocuments(query),
    ]);

    return {
      goods,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, incrementViews: boolean = false): Promise<Goods> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid goods ID');
    }

    const goods = await this.goodsModel
      .findById(id)
      .populate({
        path: 'vendor',
        populate: [{ path: 'location' }, { path: 'user', select: '-password' }],
      })
      .populate('createdBy', '-password')
      .populate('flaggedBy', '-password')
      .populate('approvedBy', '-password');

    if (!goods) {
      throw new NotFoundException('Goods not found');
    }

    if (incrementViews) {
      goods.views += 1;
      await goods.save();
    }

    return goods;
  }

  async findByVendor(
    vendorId: string,
    queryDto: QueryGoodsDto,
  ): Promise<{ goods: Goods[]; total: number; pages: number }> {
    return this.findAll({ ...queryDto, vendorId }, false);
  }

  async update(
    id: string,
    userId: string,
    updateGoodsDto: UpdateGoodsDto,
  ): Promise<Goods> {
    const goods = await this.goodsModel.findById(id);

    if (!goods) {
      throw new NotFoundException('Goods not found');
    }

    if (goods.createdBy.toString() !== userId) {
      throw new ForbiddenException('You can only update your own goods');
    }

    Object.assign(goods, updateGoodsDto);
    await goods.save();

    return goods.populate(['vendor', 'createdBy']);
  }

  async updateStatus(
    id: string,
    adminId: string,
    status: GoodsStatus,
    reason?: string,
  ): Promise<Goods> {
    const goods = await this.goodsModel.findById(id);

    if (!goods) {
      throw new NotFoundException('Goods not found');
    }

    goods.status = status;

    if (status === GoodsStatus.APPROVED) {
      goods.approvedAt = new Date();
      goods.approvedBy = new Types.ObjectId(adminId);
      goods.flagReason = undefined;
      goods.flaggedBy = undefined;
      goods.flaggedAt = undefined;
    } else if (status === GoodsStatus.FLAGGED || status === GoodsStatus.DROPPED) {
      goods.flagReason = reason;
      goods.flaggedBy = new Types.ObjectId(adminId);
      goods.flaggedAt = new Date();
      if (status === GoodsStatus.DROPPED) {
        goods.isAvailable = false;
      }
    }

    await goods.save();

    return goods.populate(['vendor', 'createdBy', 'flaggedBy', 'approvedBy']);
  }

  async remove(id: string, userId: string, isAdmin: boolean = false): Promise<void> {
    const goods = await this.goodsModel.findById(id);

    if (!goods) {
      throw new NotFoundException('Goods not found');
    }

    if (!isAdmin && goods.createdBy.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own goods');
    }

    await this.vendorsService.incrementGoodsCount(goods.vendor.toString(), -1);
    await goods.deleteOne();
  }

  async getCategories(): Promise<string[]> {
    return this.goodsModel.distinct('category', { status: GoodsStatus.APPROVED });
  }

  async getStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    flagged: number;
    dropped: number;
  }> {
    const [total, pending, approved, flagged, dropped] = await Promise.all([
      this.goodsModel.countDocuments(),
      this.goodsModel.countDocuments({ status: GoodsStatus.PENDING }),
      this.goodsModel.countDocuments({ status: GoodsStatus.APPROVED }),
      this.goodsModel.countDocuments({ status: GoodsStatus.FLAGGED }),
      this.goodsModel.countDocuments({ status: GoodsStatus.DROPPED }),
    ]);

    return { total, pending, approved, flagged, dropped };
  }
}