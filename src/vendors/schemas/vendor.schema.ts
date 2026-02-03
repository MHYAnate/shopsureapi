import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Location } from '../../locations/schemas/location.schema';
import { VendorType } from '../../common/enums/vendor-type.enum';

export type VendorDocument = Vendor & Document;

export enum VendorStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
}

@Schema({ timestamps: true })
export class Vendor {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  user: User | Types.ObjectId;

  @Prop({ required: true })
  businessName: string;

  @Prop({ required: true })
  businessDescription: string;

  @Prop({ type: String, enum: VendorType, required: true })
  vendorType: VendorType;

  // Location Reference (for market/mall vendors)
  @Prop({ type: Types.ObjectId, ref: 'Location' })
  location?: Location | Types.ObjectId;

  // Shop Details
  @Prop()
  shopNumber?: string;

  @Prop()
  shopFloor?: string;

  @Prop()
  shopBlock?: string;

  // Home-based vendor address
  @Prop()
  homeAddress?: string;

  @Prop()
  homeState?: string;

  @Prop()
  homeLga?: string;

  @Prop()
  homeArea?: string;

  // Coordinates for home-based vendors
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
  coordinates?: {
    type: string;
    coordinates: [number, number];
  };

  @Prop()
  businessPhone: string;

  @Prop()
  businessEmail: string;

  @Prop()
  logo?: string;

  @Prop([String])
  documents: string[];

  @Prop([String])
  images: string[];

  @Prop({ type: String, enum: VendorStatus, default: VendorStatus.PENDING })
  status: VendorStatus;

  @Prop()
  verifiedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  verifiedBy?: User | Types.ObjectId;

  @Prop()
  rejectionReason?: string;

  @Prop({ default: 0 })
  totalGoods: number;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  totalReviews: number;

  @Prop([String])
  categories: string[];

  @Prop()
  whatsappNumber?: string;

  @Prop()
  instagramHandle?: string;

  @Prop()
  facebookPage?: string;

  @Prop({ default: true })
  isOpen: boolean;

  @Prop()
  openingHours?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const VendorSchema = SchemaFactory.createForClass(Vendor);

// Indexes
VendorSchema.index({ user: 1 });
VendorSchema.index({ status: 1 });
VendorSchema.index({ location: 1 });
VendorSchema.index({ vendorType: 1 });
VendorSchema.index({ homeState: 1 });
VendorSchema.index({ homeLga: 1 });
VendorSchema.index({ coordinates: '2dsphere' });
VendorSchema.index({ businessName: 'text', businessDescription: 'text' });
VendorSchema.index({ categories: 1 });

VendorSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete (ret as any).__v;
    return ret;
  },
});