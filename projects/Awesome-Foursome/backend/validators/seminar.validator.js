import { param, body } from "express-validator";

export function validateSeminarId() {
	return [
		param("id")
			.isMongoId()
			.withMessage("Invalid seminar ID"),
	];
}

export function validateSeminar() {
	return [
		body("title")
			.trim()
			.notEmpty()
			.withMessage("Title is required")
			.isLength({ max: 200 })
			.withMessage("Title must be at most 200 characters"),

		body("description")
			.trim()
			.notEmpty()
			.withMessage("Description is required")
			.isLength({ max: 1000 })
			.withMessage("Description must be at most 1000 characters"),

		body("professor")
			.trim()
			.notEmpty()
			.withMessage("Professor is required")
			.isLength({ max: 120 })
			.withMessage("Professor must be at most 120 characters"),

		body("room")
			.trim()
			.notEmpty()
			.withMessage("Room is required")
			.isLength({ max: 120 })
			.withMessage("Room must be at most 120 characters"),

		body("time")
			.trim()
			.notEmpty()
			.withMessage("Time is required")
			.isLength({ max: 120 })
			.withMessage("Time must be at most 120 characters"),

		body("image")
			.optional()
			.trim()
			.isLength({ max: 500 })
			.withMessage("Image must be at most 500 characters"),

		body("isCurrent")
			.optional()
			.isBoolean()
			.withMessage("isCurrent must be a boolean"),

		body("capacity")
			.notEmpty()
			.withMessage("Capacity is required")
			.isInt({ min: 1 })
			.withMessage("Capacity must be a positive integer"),
	];
}

export default { validateSeminarId, validateSeminar };
