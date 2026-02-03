import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { LocationType } from '../../common/enums/location-type.enum';

export type LocationDocument = Location & Document;

@Schema({ timestamps: true })
export class Location {
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: LocationType })
  type: LocationType;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  lga: string;

  @Prop({ required: true })
  area: string;

  @Prop()
  address: string;

  @Prop()
  description: string;

  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
  })
  coordinates: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };

  @Prop({ default: true })
  isActive: boolean;

  @Prop([String])
  images: string[];

  @Prop()
  openingHours?: string;

  @Prop()
  contactPhone?: string;

  @Prop()
  contactEmail?: string;

  @Prop({ default: 0 })
  totalVendors: number;

  createdAt: Date;
  updatedAt: Date;
}

export const LocationSchema = SchemaFactory.createForClass(Location);

// Create 2dsphere index for geospatial queries
LocationSchema.index({ coordinates: '2dsphere' });
LocationSchema.index({ state: 1 });
LocationSchema.index({ lga: 1 });
LocationSchema.index({ type: 1 });
LocationSchema.index({ name: 'text', area: 'text', address: 'text' });

LocationSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete (ret as any).__v;
    return ret;
  },
});