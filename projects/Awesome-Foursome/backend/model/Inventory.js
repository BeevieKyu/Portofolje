import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true,
		minlength: 1,
		maxlength: 120
	},
	quantity: {
		type: Number,
		required: true,
		min: 0,
        max: 100,
		default: 0
	},
	available: {
		type: Number,
		required: true,
		min: 0,
        max: 100,
		default: 0
	},
	description: {
		type: String,
		trim: true,
		maxlength: 500,
		default: ""
	},
	image: {
		type: String,
		trim: true,
		maxlength: 500,
		default: ""
	}
}, {
	timestamps: true
});

const InventoryItem = mongoose.model("InventoryItem", inventorySchema);

export default InventoryItem;   