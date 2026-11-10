import InventoryItem from "../model/Inventory.js";

export async function getAllInventory() {
	return InventoryItem.find().sort({ createdAt: 1 }).lean();
}

export async function getInventoryItem(id) {
	return InventoryItem.findById(id);
}

export async function createInventoryItem(data) {
	const { name, quantity = 0, available = 0, description = "", image = "" } = data;
	return InventoryItem.create({
		name,
		quantity: Math.max(0, Number(quantity) || 0),
		available: Math.max(0, Number(available) || 0),
		description,
		image,
	});
}

export async function updateInventoryItem(item, updates) {
	if (updates.quantity !== undefined) item.quantity = Math.max(0, Number(updates.quantity) || 0);
	if (updates.available !== undefined) item.available = Math.max(0, Number(updates.available) || 0);
	if (updates.name !== undefined) item.name = updates.name;
	if (updates.description !== undefined) item.description = updates.description;
	if (updates.image !== undefined) item.image = updates.image;
	return item.save();
}

export async function deleteInventoryItem(id) {
	return InventoryItem.findByIdAndDelete(id);
}

export default {
	getAllInventory,
	getInventoryItem,
	createInventoryItem,
	updateInventoryItem,
	deleteInventoryItem,
};
