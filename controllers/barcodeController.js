
import { storeItem } from "../Models/bookModules.js";

export const getItemByBarcode = async (req, res) => {
    try {
        const { barcode } = req.params;
        const item = await storeItem.findOne({ barcode });
        if (!item) return res.status(404).json({ message: "Item not found" });
        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const deleteItemByBarcode = async (req, res) => {
    try {
        const { barcode } = req.params;
        const deletedItem = await storeItem.findOneAndDelete({ barcode });
        if (!deletedItem) return res.status(404).json({ message: "Item not found" });
        res.status(200).json({ message: "Item deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};