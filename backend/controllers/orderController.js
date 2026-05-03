const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const { reduceStockForOrder } = require('./inventoryController');

// @POST /api/orders
const createOrder = async (req, res) => {
  try {
    const { items, specialRequest, tableNumber } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem) return res.status(404).json({ message: `Menu item not found` });
      if (!menuItem.available) {
        return res.status(400).json({ message: `${menuItem.name} is not available` });
      }
      totalAmount += menuItem.price * item.quantity;
      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        quantity: item.quantity,
        unitPrice: menuItem.price,
      });
      menuItem.orderCount += item.quantity;
      await menuItem.save();
    }

    const order = await Order.create({
      customer: req.user.id,
      items: orderItems,
      totalAmount,
      specialRequest,
      tableNumber,
    });

    // Auto reduce stock — 0.5 units per ingredient per order item
    await reduceStockForOrder(orderItems);

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/orders/my
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/orders — with search support
const getAllOrders = async (req, res) => {
  try {
    const { search, date, status } = req.query;

    let query = {};

    // Filter by status
    if (status && status !== 'ALL') {
      query.status = status;
    }

    // Filter by date
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: start, $lte: end };
    }

    let orders = await Order.find(query)
      .populate('customer', 'name email mobile')
      .sort({ createdAt: -1 });

    // Search by order ID or customer name
    if (search) {
      const s = search.toLowerCase();
      orders = orders.filter(o =>
        o._id.toString().includes(search) ||
        o._id.toString().slice(-6).toLowerCase().includes(s) ||
        o.customer?.name?.toLowerCase().includes(s) ||
        o.customer?.email?.toLowerCase().includes(s)
      );
    }

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email mobile');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['PENDING','PREPARING','READY','DELIVERED','CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id, { status }, { new: true }
    ).populate('customer', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/orders/:id/cancel
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not your order' });
    }
    if (order.status !== 'PENDING') {
      return res.status(400).json({ message: 'Can only cancel pending orders' });
    }
    order.status = 'CANCELLED';
    await order.save();
    res.json({ message: 'Order cancelled', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createOrder, getMyOrders, getAllOrders,
  getOrderById, updateOrderStatus, cancelOrder
};