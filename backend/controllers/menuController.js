const MenuItem = require('../models/MenuItem');

// @GET /api/menu — get all menu items
const getAllMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/menu/available — get only available items
const getAvailableMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find({ available: true }).sort({ category: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/menu/category/:category
const getByCategory = async (req, res) => {
  try {
    const items = await MenuItem.find({
      category: req.params.category.toUpperCase(),
      available: true
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/menu — create menu item (Admin only)
const createMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, imageUrl, availableFrom, availableTo } = req.body;
    const item = await MenuItem.create({
      name, description, price, category,
      imageUrl, availableFrom, availableTo
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/menu/:id — update menu item (Admin only)
const updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(
      req.params.id, req.body, { new: true }
    );
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @DELETE /api/menu/:id — delete menu item (Admin only)
const deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Menu item deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/menu/toggle/:id — toggle availability (Admin only)
const toggleAvailability = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    item.available = !item.available;
    await item.save();
    res.json({ message: `Item is now ${item.available ? 'available' : 'unavailable'}`, item });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/menu/popular — top 5 most ordered
const getPopularItems = async (req, res) => {
  try {
    const items = await MenuItem.find({ available: true })
      .sort({ orderCount: -1 })
      .limit(5);
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/menu/analytics
const getMenuAnalytics = async (req, res) => {
  try {
    const Order = require('../models/Order');

    // Best selling items overall
    const topItems = await MenuItem.find()
      .sort({ orderCount: -1 }).limit(10);

    // Orders in last 7 days
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const weeklyOrders = await Order.find({
      createdAt: { $gte: weekAgo },
      status: { $ne: 'CANCELLED' }
    });

    const monthlyOrders = await Order.find({
      createdAt: { $gte: monthAgo },
      status: { $ne: 'CANCELLED' }
    });

    // Count item frequency in weekly orders
    const weeklyCount = {};
    weeklyOrders.forEach(order => {
      order.items.forEach(item => {
        weeklyCount[item.name] = (weeklyCount[item.name] || 0) + item.quantity;
      });
    });

    const monthlyCount = {};
    monthlyOrders.forEach(order => {
      order.items.forEach(item => {
        monthlyCount[item.name] = (monthlyCount[item.name] || 0) + item.quantity;
      });
    });

    const weeklyTop = Object.entries(weeklyCount)
      .sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    const monthlyTop = Object.entries(monthlyCount)
      .sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Category breakdown
    const categoryStats = await MenuItem.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, totalOrders: { $sum: '$orderCount' } } },
      { $sort: { totalOrders: -1 } }
    ]);

    res.json({
      topItems,
      weeklyTop,
      monthlyTop,
      categoryStats,
      totalItems:     await MenuItem.countDocuments(),
      availableItems: await MenuItem.countDocuments({ available: true }),
      totalOrders:    topItems.reduce((sum, i) => sum + i.orderCount, 0),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllMenuItems, getAvailableMenuItems, getByCategory,
  createMenuItem, updateMenuItem, deleteMenuItem,
  toggleAvailability, getPopularItems, getMenuAnalytics
};