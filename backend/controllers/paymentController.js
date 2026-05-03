const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Refund = require('../models/Refund');

const TAX_RATE = 0.10;

// @POST /api/payment/process
const processPayment = async (req, res) => {
  try {
    const { orderId, method, discountPercent, bankReference } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.paymentStatus === 'PAID') {
      return res.status(400).json({ message: 'Order already paid' });
    }

    const discount = discountPercent
      ? (order.totalAmount * discountPercent) / 100 : 0;
    const afterDiscount = order.totalAmount - discount;
    const tax = afterDiscount * TAX_RATE;
    const finalAmount = afterDiscount + tax;
    const transactionId = 'TXN' + Date.now();

    const payment = await Payment.create({
      order: orderId,
      customer: order.customer,
      amount: order.totalAmount,
      method,
      status: 'COMPLETED',
      discount,
      tax,
      finalAmount,
      transactionId,
      bankReference: bankReference || null,
    });

    order.paymentStatus = 'PAID';
    await order.save();

    res.status(201).json({
      message: 'Payment successful',
      payment,
      invoice: {
        orderId:       order._id,
        items:         order.items,
        subtotal:      order.totalAmount,
        discount,
        tax,
        finalAmount,
        method,
        transactionId,
        paidAt:        payment.createdAt,
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/payment/invoice/:orderId
const getInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('customer', 'name email mobile');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const payment = await Payment.findOne({ order: req.params.orderId });
    res.json({ order, payment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/payment/refund/request
const requestRefund = async (req, res) => {
  try {
    const { paymentId, reason } = req.body;
    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    if (payment.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not your payment' });
    }
    if (payment.status === 'REFUNDED') {
      return res.status(400).json({ message: 'Already refunded' });
    }

    const existing = await Refund.findOne({ payment: paymentId, status: 'PENDING' });
    if (existing) {
      return res.status(400).json({ message: 'Refund request already submitted' });
    }

    const refund = await Refund.create({
      payment: paymentId,
      order:   payment.order,
      customer: payment.customer,
      amount:  payment.finalAmount,
      reason,
    });

    res.status(201).json({ message: 'Refund request submitted successfully', refund });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/payment/refund/process/:refundId (Admin/Staff)
const processRefund = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const refund = await Refund.findById(req.params.refundId);
    if (!refund) return res.status(404).json({ message: 'Refund not found' });

    refund.status = status;
    refund.adminNote = adminNote;
    refund.processedBy = req.user.id;
    await refund.save();

    if (status === 'APPROVED') {
      await Payment.findByIdAndUpdate(refund.payment, { status: 'REFUNDED' });
      await Order.findByIdAndUpdate(refund.order, { paymentStatus: 'UNPAID' });
    }

    res.json({ message: `Refund ${status.toLowerCase()} successfully`, refund });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/payment/refunds/all (Admin/Staff)
const getAllRefunds = async (req, res) => {
  try {
    const refunds = await Refund.find()
      .populate('customer', 'name email')
      .populate('payment')
      .populate('order')
      .sort({ createdAt: -1 });
    res.json(refunds);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/payment/refunds/my
const getMyRefunds = async (req, res) => {
  try {
    const refunds = await Refund.find({ customer: req.user.id })
      .populate('payment')
      .sort({ createdAt: -1 });
    res.json(refunds);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/payment/all
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('customer', 'name email')
      .populate('order')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/payment/my
const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ customer: req.user.id })
      .populate('order')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  processPayment, getInvoice,
  requestRefund, processRefund,
  getAllRefunds, getMyRefunds,
  getAllPayments, getMyPayments,
};