
import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  items: [{ name: String, price: Number }],
  total: Number,
  paid: Boolean,
  status: String,
  createdAt: { type: Date, default: Date.now },
  scheduledTime: String,
});

const Order = mongoose.model('Order', OrderSchema);
export default Order;



