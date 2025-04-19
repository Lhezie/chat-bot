import express from "express";
import axios from "axios";
import MenuItem from "../models/MenuItem.js";
import Order from "../models/Order.js";
import dotenv from 'dotenv';

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
  console.log("Chat route hit");

  try {
    const { message, sessionId } = req.body;
    console.log("Message:", message, "| Session:", sessionId);

    const session = req.session;
    session.deviceId = sessionId;
    if (!session.currentOrder) session.currentOrder = [];

    const input = message.trim();

    //  Menu shows once user types "1"
    if (input === "1") {
      console.log("Fetching menu...");
      const menu = await MenuItem.find();
      session.menu = menu;

      const menuList = menu
        .map((item, i) => `${i + 1} - ${item.name} - ₦${item.price}`)
        .join("\n");

      return res.json({
        reply: `Menu:\n${menuList}\nSelect item number to add.`,
      });
    }

    // Add the selected item to order if input is number and menu exists
    if (!isNaN(input) && session.menu && session.menu.length > 0) {
      const index = parseInt(input) - 1;
      const menu = session.menu;

      if (menu[index]) {
        session.currentOrder.push(menu[index]);
        return res.json({
          reply: ` ${menu[index].name} added to your order.\nType another number or 99 to checkout.`,
        });
      }
    }

    //  Show current order
    if (input === "97") {
      if (!session.currentOrder.length) {
        return res.json({ reply: "🕳️ No current order." });
      }
      const list = session.currentOrder
        .map((item, i) => `${i + 1}. ${item.name} - ₦${item.price}`)
        .join("\n");
      return res.json({ reply: ` Current Order:\n${list}` });
    }

    // Checkout/Make payment via paystack 
    if (input === "99") {
      if (session.currentOrder.length === 0) {
        return res.json({
          reply: `Order placed!`, 
          payUrl: paymentUrl,    
          amount: total * 100     
        });
      }

      const total = session.currentOrder.reduce(
        (sum, item) => sum + item.price,
        0
      );
      console.log(` Total: ₦${total} | Items:`, session.currentOrder.length);

      const newOrder = await Order.create({
        sessionId: session.deviceId,
        items: session.currentOrder,
        total,
        paid: false,
        status: "Pending",
      });

      session.currentOrder = [];

      console.log(" Creating Paystack payment link...");
      const paystackResponse = await axios.post(
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

      const paymentUrl = paystackResponse.data.data.authorization_url;
      return res.json({
        reply: ` Order placed!\nTotal: ₦${total}\n Click below to pay:\n${paymentUrl}`,
      });
    }

    // View order history
    if (input === "98") {
      console.log(" Fetching order history...");
      const orders = await Order.find({ sessionId: session.deviceId });
      const history = orders
        .map((o, i) => `${i + 1}. ₦${o.total} - ${o.status}`)
        .join("\n");

      return res.json({
        reply: ` Order History:\n${history || "No orders yet."}`,
      });
    }

    // Cancel order
    if (input === "0") {
      session.currentOrder = [];
      return res.json({ reply: " Your order has been cancelled." });
    }

    // Fallback: Repeat options
    return res.json({ reply: OPTIONS });

  } catch (error) {
    console.error("Chat route error:", error);
    return res.status(500).send("Something went wrong in the chat route.");
  }
});

export default router;

// import express from 'express';
// const router = express.Router();

// router.post('/', (req, res) => {
//   console.log('chatRoutes POST hit');
//   res.json({ reply: 'basic response from chatRoutes' });
// });

// export default router;
