import express from 'express';
import Order from '../models/Order.js';
import mongoose from 'mongoose';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { customerName, phoneNumber, address, products, deliveryArea } = req.body;

    // Validation
    const requiredFields = ['customerName', 'phoneNumber', 'address', 'products', 'deliveryArea'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please select at least one product'
      });
    }

    // Process products
    const processedProducts = products.map(p => ({
      name: p.name,
      weight: p.weight,
      price: Number(p.price),
      quantity: Number(p.quantity) || 1,
      total: Number(p.price) * (Number(p.quantity) || 1)
    }));

    // Calculate totals
    const subtotal = processedProducts.reduce((sum, p) => sum + p.total, 0);
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
      currentStatus: 'ordered'
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
        error: 'Validation failed',
        details: errors
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const orders = await Order.find();
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message || 'Unknown error'
    });
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const { status, adminName } = req.body;
    const validStatuses = ['confirmed', 'advanced', 'delivering', 'delivered', 'failed', 'rejected'];

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
      error: error.message || 'Unknown error'
    });
  }
});

export default router;
