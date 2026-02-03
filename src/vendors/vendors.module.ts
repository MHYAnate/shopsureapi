import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VendorsService } from './vendors.service';
import { VendorsController } from './vendors.controller';
import { Vendor, VendorSchema } from './schemas/vendor.schema';
import { UsersModule } from '../users/users.module';
import { LocationsModule } from '../locations/locations.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Vendor.name, schema: VendorSchema }]),
    UsersModule,
    LocationsModule,
  ],
  controllers: [VendorsController],
  providers: [VendorsService],
  exports: [VendorsService],
})
export class VendorsModule {}