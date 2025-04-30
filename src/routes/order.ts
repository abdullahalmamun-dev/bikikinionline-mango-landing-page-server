// backend/src/routes/order.ts
import express from 'express';
import { Request, Response } from 'express';
import Order, { Status } from '../models/Order';
import mongoose from 'mongoose';

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { customerName, phoneNumber, address, products, deliveryArea } = req.body;

    // Validate required fields
    const requiredFields = ['customerName', 'phoneNumber', 'address', 'products', 'deliveryArea'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `অনুগ্রহ করে নিম্নলিখিত ফিল্ডগুলি পূরণ করুন: ${missingFields.join(', ')}`
      });
    }

    // Validate products array
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'অনুগ্রহ করে অন্তত একটি পণ্য নির্বাচন করুন'
      });
    }

    // Process products
    const processedProducts = products.map((p: any) => ({
      name: p.name,
      weight: p.weight,
      price: Number(p.price),
      quantity: Number(p.quantity) || 1,
      total: Number(p.price) * (Number(p.quantity) || 1)
    }));

    // Calculate totals
    const subtotal = processedProducts.reduce((sum: number, p) => sum + p.total, 0);
    const deliveryCharge = deliveryArea === 'dhaka' ? 80 : 150;
    const grandTotal = subtotal + deliveryCharge;

    // Create order
    const order = new Order({
      customerName: customerName.trim(),
      phoneNumber: phoneNumber.trim(),
      address: {
        house: address.house.trim(),
        road: address.road?.trim(),
        area: address.area.trim(),
        policeStation: address.policeStation.trim(),
        district: address.district.trim(),
        division: address.division.trim()
      },
      deliveryArea,
      products: processedProducts,
      subtotal,
      deliveryCharge,
      grandTotal,
      currentStatus: 'ordered' as Status
    });

    const savedOrder = await order.save();
    
    res.status(201).json({
      success: true,
      data: savedOrder
    });

  } catch (error) {
    console.error('Order creation error:', error);
    
    if (error instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        error: 'ভ্যালিডেশন ব্যর্থ হয়েছে',
        details: errors
      });
    }

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'অভ্যন্তরীণ সার্ভার ত্রুটি'
    });
  }
});





// Get all orders
// Get all orders
router.get('/', async (req: Request, res: Response) => {
  try {
    const orders = await Order.find();
    res.json({
      success: true,
      data: orders // Ensure response has consistent structure
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});



// Update order status (Admin endpoint)
router.put<{ id: string }, any, { status: Exclude<Status, 'ordered'>; adminName?: string }>(
  '/:id/status', 
  async (req, res) => {
    try {
      const { status, adminName } = req.body;
      const validStatuses: Exclude<Status, 'ordered'>[] = 
        ['confirmed', 'advanced', 'delivering', 'delivered', 'failed', 'rejected'];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      order.statusHistory.push({
        status,
        timestamp: new Date(),
        updatedBy: adminName || 'admin'
      });
      
      order.currentStatus = status;
      await order.save();
      
      return res.json(order);
    } catch (error) {
      return res.status(500).json({ 
        message: 'Error updating status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export default router;
