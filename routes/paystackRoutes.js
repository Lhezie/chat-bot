import express from "express";
import axios from "axios";
import Order from "../models/Order.js";

const router = express.Router();

// Payment verification
router.get("/callback", async (req, res) => {
  const { reference } = req.query;
  try {
    const verifyRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
        },
      }
    );
    const data = verifyRes.data.data;
    const orderId = data.metadata?.orderId;

    if (data.status === "success" && orderId) {
      await Order.findByIdAndUpdate(orderId, { paid: true, status: "Paid" });
      return res.redirect(`${process.env.FRONTEND_URL}/payment-success`);
    } else {
      return res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
    }
  } catch (err) {
    console.error("Error verifying payment:", err.response?.data || err.message);
    return res.status(500).send("Error verifying payment");
  }
});

export default router;