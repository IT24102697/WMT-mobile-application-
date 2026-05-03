const Ingredient = require('../models/Ingredient');

// @GET /api/inventory — get all ingredients
const getAllIngredients = async (req, res) => {
  try {
    const ingredients = await Ingredient.find().sort({ name: 1 });
    res.json(ingredients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/inventory/low-stock
const getLowStockItems = async (req, res) => {
  try {
    const ingredients = await Ingredient.find({
      $expr: { $lte: ['$currentStock', '$minStock'] }
    });
    res.json(ingredients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/inventory — add ingredient
const addIngredient = async (req, res) => {
  try {
    const { name, unit, currentStock, minStock, price, category, supplier, usagePerOrder } = req.body;
    const ingredient = await Ingredient.create({
      name, unit, currentStock, minStock,
      price, category, supplier,
      usagePerOrder: usagePerOrder || 0.5
    });
    res.status(201).json(ingredient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/inventory/:id — update ingredient
const updateIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findByIdAndUpdate(
      req.params.id, req.body, { new: true }
    );
    if (!ingredient) return res.status(404).json({ message: 'Ingredient not found' });
    res.json(ingredient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/inventory/:id/restock — add stock
const restockIngredient = async (req, res) => {
  try {
    const { quantity } = req.body;
    const ingredient = await Ingredient.findById(req.params.id);
    if (!ingredient) return res.status(404).json({ message: 'Ingredient not found' });
    ingredient.currentStock += Number(quantity);
    await ingredient.save();
    res.json({
      message: `Stock updated. New stock: ${ingredient.currentStock} ${ingredient.unit}`,
      ingredient
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @DELETE /api/inventory/:id
const deleteIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findByIdAndDelete(req.params.id);
    if (!ingredient) return res.status(404).json({ message: 'Ingredient not found' });
    res.json({ message: 'Ingredient deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/inventory/summary
const getInventorySummary = async (req, res) => {
  try {
    const all = await Ingredient.find();
    const total = all.length;
    const lowStock = all.filter(i => i.currentStock <= i.minStock && i.currentStock > 0).length;
    const outOfStock = all.filter(i => i.currentStock === 0).length;
    const healthy = all.filter(i => i.currentStock > i.minStock).length;
    res.json({ total, lowStock, outOfStock, healthy });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Called internally when order is placed
// Reduces 0.5 units of every ingredient per order item
const reduceStockForOrder = async (orderItems) => {
  try {
    const ingredients = await Ingredient.find();
    for (const ingredient of ingredients) {
      let totalReduction = 0;
      for (const item of orderItems) {
        totalReduction += ingredient.usagePerOrder * item.quantity;
      }
      ingredient.currentStock = Math.max(0, ingredient.currentStock - totalReduction);
      await ingredient.save();
    }
  } catch (err) {
    console.log('Stock reduction error:', err.message);
  }
};

module.exports = {
  getAllIngredients, getLowStockItems, addIngredient,
  updateIngredient, restockIngredient, deleteIngredient,
  getInventorySummary, reduceStockForOrder
};