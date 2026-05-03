const User = require('../models/User');
const TrustHistory = require('../models/TrustHistory');
const Discount = require('../models/Discount');

// Trust score levels
const getTrustLevel = (score) => {
  if (score >= 80) return { level: 'HIGH_TRUST', label: '🌟 High Trust', color: '#2e7d32' };
  if (score >= 60) return { level: 'NORMAL',     label: '✅ Normal',     color: '#1565c0' };
  if (score >= 40) return { level: 'WARNING',    label: '⚠️ Warning',    color: '#e65100' };
  return               { level: 'RESTRICTED',    label: '🚫 Restricted', color: '#c62828' };
};

// @GET /api/trust/my — customer views their trust score
const getMyTrustScore = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('name trustScore');
    const history = await TrustHistory.find({ customer: req.user.id })
      .sort({ createdAt: -1 }).limit(10);
    const trustInfo = getTrustLevel(user.trustScore);
    res.json({ ...user.toJSON(), ...trustInfo, history });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/trust/update/:customerId — admin updates trust score
const updateTrustScore = async (req, res) => {
  try {
    const { change, reason } = req.body;
    const user = await User.findById(req.params.customerId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const newScore = Math.max(0, Math.min(100, user.trustScore + change));
    user.trustScore = newScore;
    await user.save();

    await TrustHistory.create({
      customer: user._id,
      change,
      reason,
      newScore,
    });

    res.json({
      message: 'Trust score updated',
      newScore,
      ...getTrustLevel(newScore),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/trust/all — admin views all customer trust scores
const getAllTrustScores = async (req, res) => {
  try {
    const customers = await User.find({ role: 'CUSTOMER' })
      .select('name email trustScore')
      .sort({ trustScore: 1 });
    const result = customers.map(c => ({
      ...c.toJSON(),
      ...getTrustLevel(c.trustScore),
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/trust/discount — admin creates discount
const createDiscount = async (req, res) => {
  try {
    const { code, description, percent, minOrder, usageLimit, expiresAt } = req.body;
    const discount = await Discount.create({
      code, description, percent, minOrder, usageLimit, expiresAt
    });
    res.status(201).json(discount);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/trust/discounts — get all discounts
const getAllDiscounts = async (req, res) => {
  try {
    const discounts = await Discount.find().sort({ createdAt: -1 });
    res.json(discounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/trust/discount/validate — validate discount code
const validateDiscount = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    const discount = await Discount.findOne({ code: code.toUpperCase(), active: true });

    if (!discount) return res.status(404).json({ message: 'Invalid discount code' });
    if (discount.usageCount >= discount.usageLimit) {
      return res.status(400).json({ message: 'Discount code has expired' });
    }
    if (discount.expiresAt && new Date() > discount.expiresAt) {
      return res.status(400).json({ message: 'Discount code has expired' });
    }
    if (orderAmount < discount.minOrder) {
      return res.status(400).json({
        message: `Minimum order amount is LKR ${discount.minOrder}`
      });
    }

    const discountAmount = (orderAmount * discount.percent) / 100;
    res.json({
      valid: true,
      discount,
      discountAmount,
      finalAmount: orderAmount - discountAmount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/trust/discount/toggle/:id
const toggleDiscount = async (req, res) => {
  try {
    const discount = await Discount.findById(req.params.id);
    if (!discount) return res.status(404).json({ message: 'Discount not found' });
    discount.active = !discount.active;
    await discount.save();
    res.json({ message: `Discount ${discount.active ? 'activated' : 'deactivated'}`, discount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/trust/discount/:id — update discount
const updateDiscount = async (req, res) => {
  try {
    const { description, percent, minOrder, usageLimit } = req.body;
    const discount = await Discount.findByIdAndUpdate(
      req.params.id,
      { description, percent, minOrder, usageLimit },
      { new: true }
    );
    if (!discount) return res.status(404).json({ message: 'Discount not found' });
    res.json(discount);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @DELETE /api/trust/discount/:id — delete discount
const deleteDiscount = async (req, res) => {
  try {
    const discount = await Discount.findByIdAndDelete(req.params.id);
    if (!discount) return res.status(404).json({ message: 'Discount not found' });
    res.json({ message: 'Discount deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getMyTrustScore, updateTrustScore, getAllTrustScores,
  createDiscount, getAllDiscounts, validateDiscount,
  toggleDiscount, updateDiscount, deleteDiscount
};