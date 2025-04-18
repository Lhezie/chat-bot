import express from "express";
import axios from "axios";
import MenuItem from "../models/MenuItem.js";
import Order from "../models/Order.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

const OPTIONS = `Welcome to LeezieBite Bot!
Please select an option:
1 - Place an order
99 - Checkout order
98 - See order history
97 - See current order
0 - Cancel order`;

router.post("/", async (req, res) => {
  console.log("💬 Chat route hit");

  try {
    const { message, sessionId } = req.body;
    const input = message.trim();
    const session = req.session;

    session.deviceId = sessionId;
    if (!session.currentOrder) session.currentOrder = [];

    console.log("📩 Message:", input, "| 🆔 Session:", sessionId);

    // ✅ PRIORITY: Add item to order if menu exists and input is number
    if (!isNaN(input) && session.menu && session.menu.length > 0) {
      const index = parseInt(input) - 1;
      const menu = session.menu;

      if (menu[index]) {
        session.currentOrder.push(menu[index]);
        return res.json({
          reply: `✅ ${menu[index].name} added to your order.\nType another number to add more or 99 to checkout.`,
        });
      } else {
        return res.json({ reply: "❌ Invalid menu item number. Try again." });
      }
    }

    // ✅ STEP 1: Show menu when user types '1'
    if (input === "1") {
      const menu = await MenuItem.find();
      session.menu = menu;

      const menuList = menu
        .map((item, i) => `${i + 1} - ${item.name} - ₦${item.price}`)
        .join("\n");

      return res.json({
        reply: `Menu:\n${menuList}\nSelect item number to add.`,
      });
    }

    // ✅ STEP 2: Show current order
    if (input === "97") {
      if (!session.currentOrder.length) {
        return res.json({ reply: "🕳️ No current order." });
      }

      const list = session.currentOrder
        .map((item, i) => `${i + 1}. ${item.name} - ₦${item.price}`)
        .join("\n");

      return res.json({ reply: `🛒 Current Order:\n${list}` });
    }

    // ✅ STEP 3: Checkout and generate Paystack link
    if (input === "99") {
      if (session.currentOrder.length === 0) {
        return res.json({
          reply: "❌ No order to checkout.\nType 1 to view the menu.",
        });
      }

      const total = session.currentOrder.reduce((sum, item) => sum + item.price, 0);
      console.log(`🧾 Checkout | Total: ₦${total} | Items: ${session.currentOrder.length}`);

      const newOrder = await Order.create({
        sessionId: session.deviceId,
        items: session.currentOrder,
        total,
        paid: false,
        status: "Pending",
      });

      session.currentOrder = [];

      const paystackRes = await axios.post(
        "https://api.paystack.co/transaction/initialize",
        {
          email: `${session.deviceId}@guest.com`,
          amount: total * 100,
          metadata: { orderId: newOrder._id.toString() },
          callback_url: `${process.env.BASE_URL}/payment/callback`,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
            "Content-Type": "application/json",
          },
        }
      );

      const paymentUrl = paystackRes.data.data.authorization_url;
      return res.json({
        reply: `✅ Order placed!\n💰 Total: ₦${total}\n🧾 Click below to pay:\n${paymentUrl}`,
      });
    }

    // ✅ STEP 4: View order history
    if (input === "98") {
      const orders = await Order.find({ sessionId: session.deviceId });

      if (orders.length === 0) {
        return res.json({ reply: "🕳️ No order history yet." });
      }

      const history = orders
        .map((o, i) => `${i + 1}. ₦${o.total} - ${o.status}`)
        .join("\n");

      return res.json({ reply: `📜 Order History:\n${history}` });
    }

    // ✅ STEP 5: Cancel current order
    if (input === "0") {
      session.currentOrder = [];
      return res.json({ reply: "❌ Your order has been cancelled." });
    }

    // ✅ Default fallback
    return res.json({ reply: OPTIONS });

  } catch (err) {
    console.error("❌ Error in chat route:", err.message);
    res.status(500).send("Server error in chat route.");
  }
});

export default router;
