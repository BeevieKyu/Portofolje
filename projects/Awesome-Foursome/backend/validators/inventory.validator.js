import { param, body } from "express-validator";

export function validateInventoryId() {
	return [
		param("id")
			.isMongoId()
			.withMessage("Invalid inventory item ID"),
	];
}

export function validateInventoryItem() {
	return [
		body("name")
			.trim()
			.notEmpty()
			.withMessage("Name is required")
			.isLength({ max: 120 })
			.withMessage("Name must be at most 120 characters"),

		body("quantity")
			.optional()
			.isInt({ min: 0, max: 100 })
			.withMessage("Quantity must be an integer between 0 and 100"),

		body("available")
			.optional()
			.isInt({ min: 0, max: 100 })
			.withMessage("Available must be an integer between 0 and 100"),

		body("description")
			.optional()
			.trim()
			.isLength({ max: 500 })
			.withMessage("Description must be at most 500 characters"),

		body("image")
			.optional()
			.trim()
			.isLength({ max: 500 })
			.withMessage("Image must be at most 500 characters"),
	];
}

export default { validateInventoryId, validateInventoryItem };
