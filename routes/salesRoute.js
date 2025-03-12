
import express from "express";
import { Sales } from "../Models/salesModel.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

router.get("/", authenticate, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sales = await Sales.find({ soldAt: { $gte: today } });

    const totalSales = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);

    res.status(200).json({ totalSales, sales });
  } catch (error) {
    console.error("Error fetching sales report:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;