import mongoose from 'mongoose';

export type Status = 'ordered' | 'confirmed' | 'advanced' | 'delivering' | 'delivered' | 'failed' | 'rejected';

interface IStatusHistory {
  status: Status;
  timestamp: Date;
  updatedBy: string;
}

interface IOrderProduct {
  name: string;
  weight: string;
  price: number;
  quantity: number;
  total: number;
}

interface IOrder {
  orderNumber: string;
  customerName: string;
  phoneNumber: string;
  address: {
    house: string;
    road?: string;
    area: string;
    policeStation: string;
    district: string;
    division: string;
  };
  deliveryArea: string;
  products: IOrderProduct[];
  subtotal: number;
  deliveryCharge: number;
  grandTotal: number;
  currentStatus: Status;
  statusHistory: IStatusHistory[];
}

const orderSchema = new mongoose.Schema<IOrder>({
  orderNumber: { 
    type: String, 
    required: true, 
    unique: true 
  },
  customerName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  address: {
    house: { type: String, required: true },
    road: String,
    area: { type: String, required: true },
    policeStation: { type: String, required: true },
    district: { type: String, required: true },
    division: { type: String, required: true }
  },
  deliveryArea: { type: String, required: true },
  products: [{
    name: { type: String, required: true },
    weight: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    total: { type: Number, required: true }
  }],
  subtotal: { type: Number, required: true },
  deliveryCharge: { type: Number, required: true },
  grandTotal: { type: Number, required: true },
  currentStatus: {
    type: String,
    enum: ['ordered', 'confirmed', 'advanced', 'delivering', 'delivered', 'failed', 'rejected'],
    default: 'ordered'
  },
  statusHistory: [{
    status: { 
      type: String, 
      enum: ['ordered', 'confirmed', 'advanced', 'delivering', 'delivered', 'failed', 'rejected'] 
    },
    timestamp: { type: Date, default: Date.now },
    updatedBy: String
  }]
});

// Generate order number before validation
orderSchema.pre('validate', function(next) {
  if (this.isNew && !this.orderNumber) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(1000 + Math.random() * 9000);
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
  next();
});

// Initialize status history before saving
orderSchema.pre('save', function(next) {
  if (this.isNew) {
    this.statusHistory = [{
      status: 'ordered',
      timestamp: new Date(),
      updatedBy: 'system'
    }];
  }
  next();
});

export default mongoose.model<IOrder>('Order', orderSchema);
