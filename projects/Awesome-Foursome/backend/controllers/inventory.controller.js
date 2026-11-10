import inventoryServices from "../services/inventory.service.js";

export async function getInventory(_req, res, next) {
    try {
        const items = await inventoryServices.getAllInventory();
        return res.status(200).json(items);
    } catch (error) {
        next(error);
    }
}

export async function createInventoryItem(req, res, next) {
    try {
        if (req.file) req.body.image = `/uploads/${req.file.filename}`;
        const newItem = await inventoryServices.createInventoryItem(req.body);
        return res.status(201).json(newItem);
    } catch (error) {
        next(error);
    }
}

export async function updateInventoryItem(req, res, next) {
    try {
        const item = await inventoryServices.getInventoryItem(req.params.id);
        if (!item) return res.status(404).json({ message: "Inventory item not found" });

        if (req.file) req.body.image = `/uploads/${req.file.filename}`;

        if (req.body.available !== undefined && req.body.available > (req.body.quantity ?? item.quantity)) {
            return res.status(400).json({ message: "Available cannot exceed quantity" });
        }

        const updated = await inventoryServices.updateInventoryItem(item, req.body);
        return res.status(200).json(updated);
    } catch (error) {
        next(error);
    }
}

export async function deleteInventoryItem(req, res, next) {
    try {
        const deleted = await inventoryServices.deleteInventoryItem(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Inventory item not found" });
        return res.status(200).json({ message: "Inventory item deleted" });
    } catch (error) {
        next(error);
    }
}

export default {
    getInventory,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
};
