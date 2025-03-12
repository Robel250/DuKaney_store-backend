


import express from "express";
import { storeItem } from "../Models/bookModules.js";
// import upload from "../middleware/multer.js";
import authenticate from "../middleware/authenticate.js";
import { sendLowStockEmail } from "../Email/sendLowStockEmail.js";
import { Sales } from "../Models/salesModel.js";

 import requireAdmin from "../middleware/requireAdmin.js"
 
const router = express.Router();

// Helper function to check low stock and send email
const checkAndSendLowStockEmail = async (item) => {
    if (item.quantity < 5) {
        await sendLowStockEmail(item);
    }
};

// ✅ Fetch all items
router.get("/",authenticate,  async (req, res) => {
    try {
        const items = await storeItem.find();
        res.status(200).json({ data: items });
    } catch (error) {
        console.error("Error fetching items:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Get an item by barcode
router.get("/barcode/:barcode", authenticate, async (req, res) => {
    try {
        const { barcode } = req.params;
        const item = await storeItem.findOne({ barcode });

        if (!item) return res.status(404).json({ message: "Item not found" });
        res.status(200).json(item);
    } catch (error) {
        console.error("Error fetching item:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Get an item by ID
router.get("/:id",authenticate, async (req, res) => {
    try {
        const item = await storeItem.findById(req.params.id);
        if (!item) return res.status(404).json({ message: "Item not found" });
        res.status(200).json(item);
    } catch (error) {
        console.error("Error fetching item:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// /sell-multiple
router.post("/sell-multiple", authenticate, async (req, res) => {
    try {
      const { items } = req.body;
    
  
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Invalid request format" });
      }
  
      const soldItems = [];
      for (const { barcode, quantitySold } of items) {
        console.log("Processing item:", barcode, quantitySold); // Debugging log
  
        // Validate quantitySold
        if (!quantitySold || isNaN(quantitySold) || quantitySold <= 0) {
          return res.status(400).json({ message: "Invalid quantity for item with barcode " + barcode });
        }
  
       
        const item = req.userRole === 'admin'
        ? await storeItem.findOne({ barcode, userId: req.userId }) // Admin-specific query
        : await storeItem.findOne({ barcode }); // Seller can sell any item
    
  
        if (!item) {
          return res.status(404).json({ message: `Item with barcode ${barcode} not found` });
        }
  
        // Check if there is enough stock
        if (item.quantity < quantitySold) {
          return res.status(400).json({ message: `Not enough stock for item with barcode ${barcode}` });
        }
  
        // Calculate total price
        const totalPrice = quantitySold * item.price;
  
        // Create a sales record
        await Sales.create({
          itemId: item._id,
          name: item.name,
          quantitySold,
          totalPrice,
          userId: req.userId,
        });
  
        // Update the item's stock
        item.quantity -= quantitySold;
        item.totalItem = item.quantity * item.price;
        await item.save();
  
        // Check for low stock and send an email if necessary
        await checkAndSendLowStockEmail(item);
  
        // Add to soldItems array
        soldItems.push({ barcode: item.barcode, remainingStock: item.quantity });
      }
  
      res.status(200).json({ message: "Items sold successfully", soldItems });
    } catch (error) {
      console.error("Error selling multiple items:", error); // Debugging log
      res.status(500).json({ message: "Server error" });
    }
  });
  // ✅ Create a new item

// Create a new item (admin authorization required for sellers)
// router.post("/", authenticate,requireAdmin, upload.single("image"), async (req, res) => {
//     try {
//         const { name, quantity, price, expiryDate, barcode } = req.body;

//         if (!name || !quantity || !price || !expiryDate || !barcode) {
//             return res.status(400).json({ message: "All fields are required" });
//         }

//         // const imageUrl = req.file
//         //     ? `${req.protocol}://${req.get("host")}/upload/${req.file.filename}`
//         //     : "";

//         const newItem = await storeItem.create({
//             name,
//             quantity,
//             price,
//             totalItem: quantity * price,
//             expiryDate,
//             barcode,
//             image: imageUrl,
//             userId: req.userId,
//         });

//         res.status(201).json(newItem);
//     } catch (error) {
//         console.error("Error creating item:", error);
//         res.status(500).json({ message: "Server error" });
//     }
// });

router.post("/", authenticate, requireAdmin, async (req, res) => {
    try {
        console.log(req.body)

        const { name, quantity, price, expiryDate, barcode,image } = req.body;

        if (!name || !quantity || !price || !expiryDate || !barcode) {
            return res.status(400).json({ message: "All fields are required" });
        }

      

       
        const newItem = await storeItem.create({
            name,
            quantity,
            price,
            totalItem: quantity * price,
            expiryDate,
            barcode,
            image,
            userId: req.userId,
        });

        res.status(201).json(newItem);
    } catch (error) {
        console.error("Error creating item:", error);
        res.status(500).json({ message: "Server error" });
    }
});




// Update an item by ID (admin authorization required for sellers)
router.put("/:id", authenticate,requireAdmin,  async (req, res) => {
    try {
        const { name, quantity, price, expiryDate, barcode } = req.body;

        if (!name || !quantity || !price || !expiryDate || !barcode) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const item = await storeItem.findById(req.params.id);

        if (!item) return res.status(404).json({ message: "Item not found" });

        item.name = name;
        item.quantity = quantity;
        item.price = price;
        item.expiryDate = expiryDate;
        item.barcode = barcode;
        item.totalItem = quantity * price;

        if (req.file) {
            item.image = `${req.protocol}://${req.get("host")}/upload/${req.file.filename}`;
        }

        await item.save();
        res.status(200).json(item);
    } catch (error) {
        console.error("Error updating item:", error);
        res.status(500).json({ message: "Server error" });
    }
});
// Delete an item by barcode (admin authorization required for sellers)
router.delete("/barcode/:barcode", authenticate,requireAdmin, async (req, res) => {
    try {
        const { barcode } = req.params;
        const deletedItem = await storeItem.findOneAndDelete({ barcode });

        if (!deletedItem) return res.status(404).json({ message: "Item not found" });
        res.status(200).json({ message: "Item deleted successfully" });
    } catch (error) {
        console.error("Error deleting item:", error);
        res.status(500).json({ message: "Server error" });
    }
});
// Delete an item by ID (admin authorization required for sellers)
router.delete("/:id", authenticate,requireAdmin ,async (req, res) => {
    try {
        const itemId = req.params.id;
        const deletedItem = await storeItem.findByIdAndDelete(itemId);

        if (!deletedItem) return res.status(404).json({ message: "Item not found" });
        res.status(200).json({ message: "Item deleted successfully" });
    } catch (error) {
        console.error("Error deleting item:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Sell an item (reduce quantity and create sales record)
router.post("/:id/sell", authenticate,  async (req, res) => {
    try {
        const { quantitySold } = req.body;

        if (!quantitySold || isNaN(quantitySold) || quantitySold <= 0) {
            return res.status(400).json({ message: "Invalid quantity" });
        }

        const item = req.userRole === 'admin'
    ? await storeItem.findOne({ _id: req.params.id, userId: req.userId }) // Admin-specific query
    : await storeItem.findById(req.params.id); // Seller can sell any item


        if (!item) return res.status(404).json({ message: "Item not found" });

        if (item.quantity < quantitySold) {
            return res.status(400).json({ message: "Not enough stock available" });
        }

        const totalPrice = quantitySold * item.price;

        await Sales.create({
            itemId: item._id,
            name: item.name,
            quantitySold,
            totalPrice,
            userId: req.userId,
        });

        item.quantity -= quantitySold;
        item.totalItem = item.quantity * item.price;
        await item.save();

        await checkAndSendLowStockEmail(item);

        res.status(200).json({ message: "Item sold successfully", remainingStock: item.quantity });
    } catch (error) {
        console.error("Error selling item:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Search items by name
router.get("/search/:name", authenticate, async (req, res) => {
    try {
        const { name } = req.params;

        // Use a case-insensitive search for the name
        const items = await storeItem.find({
            name: { $regex: name, $options: "i" }, // 'i' makes the search case-insensitive
        });

        if (!items || items.length === 0) {
            return res.status(404).json({ message: "No items found with that name" });
        }

        res.status(200).json({ data: items });
    } catch (error) {
        console.error("Error searching for items:", error);
        res.status(500).json({ message: "Server error" });
    }
});



export default router; 

