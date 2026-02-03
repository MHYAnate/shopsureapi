import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Location, LocationDocument } from './schemas/location.schema';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { QueryLocationDto } from './dto/query-location.dto';
import { NIGERIA_LOCATIONS, NIGERIA_STATES } from './data/nigeria-locations';

@Injectable()
export class LocationsService implements OnModuleInit {
  constructor(
    @InjectModel(Location.name) private locationModel: Model<LocationDocument>,
  ) {}

  async onModuleInit() {
    await this.seedLocations();
  }

  async seedLocations(): Promise<void> {
    const count = await this.locationModel.countDocuments();
    if (count === 0) {
      console.log('Seeding locations...');
      for (const location of NIGERIA_LOCATIONS) {
        await this.locationModel.create({
          ...location,
          coordinates: {
            type: 'Point',
            coordinates: location.coordinates,
          },
        });
      }
      console.log(`Seeded ${NIGERIA_LOCATIONS.length} locations`);
    }
  }

  async create(createLocationDto: CreateLocationDto): Promise<Location> {
    const location = new this.locationModel({
      ...createLocationDto,
      coordinates: createLocationDto.coordinates
        ? {
            type: 'Point',
            coordinates: [
              createLocationDto.coordinates.longitude,
              createLocationDto.coordinates.latitude,
            ],
          }
        : undefined,
    });

    return location.save();
  }

  async findAll(
    queryDto: QueryLocationDto,
  ): Promise<{ locations: Location[]; total: number; pages: number }> {
    const {
      page = 1,
      limit = 20,
      type,
      state,
      lga,
      area,
      search,
      latitude,
      longitude,
      radiusKm = 10,
    } = queryDto;

    const query: any = { isActive: true };

    if (type) {
      query.type = type;
    }

    if (state) {
      query.state = { $regex: new RegExp(state, 'i') };
    }

    if (lga) {
      query.lga = { $regex: new RegExp(lga, 'i') };
    }

    if (area) {
      query.area = { $regex: new RegExp(area, 'i') };
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Proximity search
    if (latitude !== undefined && longitude !== undefined) {
      query.coordinates = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: radiusKm * 1000, // Convert km to meters
        },
      };
    }

    const skip = (page - 1) * limit;

    const [locations, total] = await Promise.all([
      this.locationModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort({ name: 1 }),
      this.locationModel.countDocuments(query),
    ]);

    return {
      locations,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Location> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid location ID');
    }

    const location = await this.locationModel.findById(id);
    if (!location) {
      throw new NotFoundException('Location not found');
    }

    return location;
  }

  async findByState(state: string): Promise<Location[]> {
    return this.locationModel.find({
      state: { $regex: new RegExp(state, 'i') },
      isActive: true,
    });
  }

  async findNearby(
    longitude: number,
    latitude: number,
    radiusKm: number = 10,
  ): Promise<Location[]> {
    return this.locationModel.find({
      coordinates: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: radiusKm * 1000,
        },
      },
      isActive: true,
    });
  }

  async update(id: string, updateLocationDto: UpdateLocationDto): Promise<Location> {
    const updateData: any = { ...updateLocationDto };

    if (updateLocationDto.coordinates) {
      updateData.coordinates = {
        type: 'Point',
        coordinates: [
          updateLocationDto.coordinates.longitude,
          updateLocationDto.coordinates.latitude,
        ],
      };
    }

    const location = await this.locationModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true },
    );

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    return location;
  }

  async incrementVendorCount(id: string, increment: number = 1): Promise<void> {
    await this.locationModel.findByIdAndUpdate(id, {
      $inc: { totalVendors: increment },
    });
  }

  async remove(id: string): Promise<void> {
    const result = await this.locationModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Location not found');
    }
  }

  getStates(): string[] {
    return NIGERIA_STATES;
  }

  async getStateStats(): Promise<{ state: string; count: number }[]> {
    return this.locationModel.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$state', count: { $sum: 1 } } },
      { $project: { state: '$_id', count: 1, _id: 0 } },
      { $sort: { state: 1 } },
    ]);
  }
}