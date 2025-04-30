// backend/src/models/Mango.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface SizePrice {
  weight: string;
  price: number;
}

export interface IMango extends Document {
  name: string;
  sizes: SizePrice[];
}

const MangoSchema = new Schema<IMango>({
  name: {
    type: String,
    required: true,
    unique: true
  },
  sizes: [{
    weight: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    }
  }]
}, { timestamps: true });

export default mongoose.model<IMango>('Mango', MangoSchema);
