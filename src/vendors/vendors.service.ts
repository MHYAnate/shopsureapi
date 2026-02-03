import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Vendor, VendorDocument, VendorStatus } from './schemas/vendor.schema';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto, UpdateVendorStatusDto } from './dto/update-vendor.dto';
import { QueryVendorDto } from './dto/query-vendor.dto';
import { UsersService } from '../users/users.service';
import { LocationsService } from '../locations/locations.service';
import { Role } from '../common/enums/role.enum';
import { VendorType } from '../common/enums/vendor-type.enum';

@Injectable()
export class VendorsService {
  constructor(
    @InjectModel(Vendor.name) private vendorModel: Model<VendorDocument>,
    private usersService: UsersService,
    private locationsService: LocationsService,
  ) {}

  async create(userId: string, createVendorDto: CreateVendorDto): Promise<Vendor> {
    // Check if user already has a vendor profile
    const existingVendor = await this.vendorModel.findOne({ user: userId });
    if (existingVendor) {
      throw new ConflictException('Vendor profile already exists');
    }

    const vendorData: any = {
      ...createVendorDto,
      user: userId,
    };

    // Handle location-based vendors
    if (createVendorDto.locationId) {
      const location = await this.locationsService.findOne(createVendorDto.locationId);
      vendorData.location = location._id;
    }

    // Handle coordinates
    if (createVendorDto.coordinates) {
      vendorData.coordinates = {
        type: 'Point',
        coordinates: [
          createVendorDto.coordinates.longitude,
          createVendorDto.coordinates.latitude,
        ],
      };
    }

    const vendor = new this.vendorModel(vendorData);
    await vendor.save();

    // Update user role to vendor
    await this.usersService.updateRole(userId, Role.VENDOR);

    // Increment location vendor count if applicable
    if (vendorData.location) {
      await this.locationsService.incrementVendorCount(vendorData.location.toString());
    }

    return vendor.populate(['user', 'location']);
  }

  async findAll(
    queryDto: QueryVendorDto,
    publicOnly: boolean = false,
  ): Promise<{ vendors: Vendor[]; total: number; pages: number }> {
    const {
      page = 1,
      limit = 10,
      status,
      vendorType,
      state,
      lga,
      area,
      locationId,
      search,
      category,
      latitude,
      longitude,
      radiusKm = 10,
      isOpen,
    } = queryDto;

    const query: any = {};

    // For public access, only show verified vendors
    if (publicOnly) {
      query.status = VendorStatus.VERIFIED;
    } else if (status) {
      query.status = status;
    }

    if (vendorType) {
      query.vendorType = vendorType;
    }

    if (locationId) {
      query.location = locationId;
    }

    // For home-based vendors, filter by state/lga/area
    if (state) {
      query.$or = [
        { homeState: { $regex: new RegExp(state, 'i') } },
      ];
    }

    if (lga) {
      query.homeLga = { $regex: new RegExp(lga, 'i') };
    }

    if (area) {
      query.homeArea = { $regex: new RegExp(area, 'i') };
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (category) {
      query.categories = { $in: [category] };
    }

    if (isOpen !== undefined) {
      query.isOpen = isOpen;
    }

    // Proximity search for home-based vendors
    if (latitude !== undefined && longitude !== undefined) {
      query.coordinates = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: radiusKm * 1000,
        },
      };
    }

    const skip = (page - 1) * limit;

    const [vendors, total] = await Promise.all([
      this.vendorModel
        .find(query)
        .populate('user', '-password')
        .populate('location')
        .populate('verifiedBy', '-password')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.vendorModel.countDocuments(query),
    ]);

    return {
      vendors,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Vendor> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid vendor ID');
    }

    const vendor = await this.vendorModel
      .findById(id)
      .populate('user', '-password')
      .populate('location')
      .populate('verifiedBy', '-password');

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    return vendor;
  }

  async findByUserId(userId: string): Promise<Vendor | null> {
    return this.vendorModel
      .findOne({ user: userId })
      .populate('user', '-password')
      .populate('location');
  }

  async findByLocation(locationId: string): Promise<Vendor[]> {
    return this.vendorModel
      .find({ location: locationId, status: VendorStatus.VERIFIED })
      .populate('user', '-password')
      .populate('location');
  }

  async findNearby(
    longitude: number,
    latitude: number,
    radiusKm: number = 10,
  ): Promise<Vendor[]> {
    return this.vendorModel
      .find({
        status: VendorStatus.VERIFIED,
        coordinates: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
            $maxDistance: radiusKm * 1000,
          },
        },
      })
      .populate('user', '-password')
      .populate('location');
  }

  async update(
    id: string,
    userId: string,
    updateVendorDto: UpdateVendorDto,
  ): Promise<Vendor> {
    const vendor = await this.vendorModel.findById(id);

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    if (vendor.user.toString() !== userId) {
      throw new ForbiddenException('You can only update your own vendor profile');
    }

    const updateData: any = { ...updateVendorDto };

    // Handle location change
    if (updateVendorDto.locationId) {
      const location = await this.locationsService.findOne(updateVendorDto.locationId);
      updateData.location = location._id;
      delete updateData.locationId;
    }

    // Handle coordinates
    if (updateVendorDto.coordinates) {
      updateData.coordinates = {
        type: 'Point',
        coordinates: [
          updateVendorDto.coordinates.longitude,
          updateVendorDto.coordinates.latitude,
        ],
      };
    }

    Object.assign(vendor, updateData);
    await vendor.save();

    return vendor.populate(['user', 'location']);
  }

  async updateStatus(
    id: string,
    adminId: string,
    updateStatusDto: UpdateVendorStatusDto,
  ): Promise<Vendor> {
    const vendor = await this.vendorModel.findById(id);

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    vendor.status = updateStatusDto.status;

    if (updateStatusDto.status === VendorStatus.VERIFIED) {
      vendor.verifiedAt = new Date();
      vendor.verifiedBy = new Types.ObjectId(adminId);
      vendor.rejectionReason = undefined;
    } else if (updateStatusDto.status === VendorStatus.REJECTED) {
      vendor.rejectionReason = updateStatusDto.rejectionReason;
    }

    await vendor.save();

    return vendor.populate(['user', 'location', 'verifiedBy']);
  }

  async incrementGoodsCount(vendorId: string, increment: number = 1): Promise<void> {
    await this.vendorModel.findByIdAndUpdate(vendorId, {
      $inc: { totalGoods: increment },
    });
  }

  async getCategories(): Promise<string[]> {
    return this.vendorModel.distinct('categories', {
      status: VendorStatus.VERIFIED,
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    const vendor = await this.vendorModel.findById(id);

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    if (vendor.user.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own vendor profile');
    }

    // Decrement location vendor count if applicable
    if (vendor.location) {
      await this.locationsService.incrementVendorCount(vendor.location.toString(), -1);
    }

    await vendor.deleteOne();
    await this.usersService.updateRole(userId, Role.USER);
  }
}