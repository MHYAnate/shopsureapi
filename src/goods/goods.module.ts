import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GoodsService } from './goods.service';
import { GoodsController } from './goods.controller';
import { Goods, GoodsSchema } from './schemas/goods.schema';
import { VendorsModule } from '../vendors/vendors.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Goods.name, schema: GoodsSchema }]),
    VendorsModule,
  ],
  controllers: [GoodsController],
  providers: [GoodsService],
  exports: [GoodsService],
})
export class GoodsModule {}