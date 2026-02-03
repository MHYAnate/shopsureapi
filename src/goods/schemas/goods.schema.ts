import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Vendor } from '../../vendors/schemas/vendor.schema';
import { GoodsStatus } from '../../common/enums/goods-status.enum';
import { GoodsType } from '../../common/enums/goods-type.enum';

export type GoodsDocument = Goods & Document;

@Schema({ timestamps: true })
export class Goods {
  _id: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ type: String, enum: GoodsType, required: true })
  type: GoodsType;

  @Prop()
  category: string;

  @Prop([String])
  images: string[];

  @Prop({ type: String, enum: GoodsStatus, default: GoodsStatus.PENDING })
  status: GoodsStatus;

  @Prop({ type: Types.ObjectId, ref: 'Vendor', required: true })
  vendor: Vendor | Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: User | Types.ObjectId;

  @Prop({ type: Object })
  specifications?: Record<string, any>;

  @Prop({ default: 0 })
  views: number;

  @Prop()
  flagReason?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  flaggedBy?: User | Types.ObjectId;

  @Prop()
  flaggedAt?: Date;

  @Prop()
  approvedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy?: User | Types.ObjectId;

  @Prop({ default: true })
  isAvailable: boolean;

  @Prop()
  condition?: string;

  @Prop()
  brand?: string;

  @Prop([String])
  tags: string[];

  createdAt: Date;
  updatedAt: Date;
}

export const GoodsSchema = SchemaFactory.createForClass(Goods);

GoodsSchema.index({ title: 'text', description: 'text', tags: 'text' });
GoodsSchema.index({ vendor: 1 });
GoodsSchema.index({ status: 1 });
GoodsSchema.index({ type: 1 });
GoodsSchema.index({ category: 1 });
GoodsSchema.index({ price: 1 });
GoodsSchema.index({ createdAt: -1 });

GoodsSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete (ret as any).__v;
    return ret;
  },
});