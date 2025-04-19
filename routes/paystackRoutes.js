import express from "express";
import axios from "axios";
import Order from "../models/Order.js";

const router = express.Router();

// 1️⃣ Callback handler
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

      // ✅ Redirect to frontend success page
      return res.redirect(`${process.env.FRONTEND_URL}/payment-success`);
    } else {
      return res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
    }
  } catch (err) {
    console.error("Error verifying payment:", err.response?.data || err.message);
    return res.status(500).send("Error verifying payment");
  }
});

// 2️⃣ Webhook handler
router.post(
  "/webhook",
  express.json({ type: "application/json" }),
  async (req, res) => {
    const event = req.body;
    console.log("📡 Webhook received:", event.event);
    if (event.event === "charge.success") {
      const orderId = event.data.metadata?.orderId;
      if (orderId) {
        try {
          await Order.findByIdAndUpdate(orderId, { paid: true, status: "Paid" });
          console.log("Order updated successfully from webhook");
        } catch (err) {
          console.error("Failed to update order via webhook:", err.message);
        }
      }
    }
    res.sendStatus(200);
  }
);

export default router;
