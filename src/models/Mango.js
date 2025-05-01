import mongoose from 'mongoose';

const { Schema } = mongoose;

const SizePriceSchema = new Schema({
  weight: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
});

const MangoSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  sizes: [SizePriceSchema]
}, { timestamps: true });

export default mongoose.model('Mango', MangoSchema);
