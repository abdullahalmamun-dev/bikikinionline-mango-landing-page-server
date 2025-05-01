import mongoose from 'mongoose';

const { Schema } = mongoose;

const StatusHistorySchema = new Schema({
  status: {
    type: String,
    enum: ['ordered', 'confirmed', 'advanced', 'delivering', 'delivered', 'failed', 'rejected']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  updatedBy: String
});

const OrderProductSchema = new Schema({
  name: String,
  weight: String,
  price: Number,
  quantity: Number,
  total: Number
});

const AddressSchema = new Schema({
  house: String,
  road: String,
  area: String,
  policeStation: String,
  district: String,
  division: String
});

const OrderSchema = new Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  customerName: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  address: AddressSchema,
  deliveryArea: {
    type: String,
    required: true
  },
  products: [OrderProductSchema],
  subtotal: Number,
  deliveryCharge: Number,
  grandTotal: Number,
  currentStatus: {
    type: String,
    enum: ['ordered', 'confirmed', 'advanced', 'delivering', 'delivered', 'failed', 'rejected'],
    default: 'ordered'
  },
  statusHistory: [StatusHistorySchema]
});

OrderSchema.pre('validate', function(next) {
  if (this.isNew && !this.orderNumber) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(1000 + Math.random() * 9000);
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
  next();
});

OrderSchema.pre('save', function(next) {
  if (this.isNew) {
    this.statusHistory = [{
      status: 'ordered',
      timestamp: new Date(),
      updatedBy: 'system'
    }];
  }
  next();
});

export default mongoose.model('Order', OrderSchema);
