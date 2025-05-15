import mongoose from 'mongoose';

const { Schema } = mongoose;

const StatusHistorySchema = new Schema({
  status: {
    type: String,
    enum: ['ordered', 'confirmed', 'advanced', 'delivering', 'delivered', 'failed', 'rejected', 'hidden']
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

const OrderSchema = new Schema({
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    minlength: [3, 'Customer name must be at least 3 characters']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: {
      validator: function(v) {
        return /^(?:\+88|88)?(01[3-9]\d{8})$/.test(v);
      },
      message: props => `${props.value} is not a valid Bangladeshi phone number!`
    }
  },
 address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
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
    enum: ['ordered', 'confirmed', 'advanced', 'delivering', 'delivered', 'failed', 'rejected','hidden'],
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
