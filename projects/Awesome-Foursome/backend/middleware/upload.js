import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define storage configuration
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		// Store uploads in backend/uploads directory
		cb(null, path.join(__dirname, "../uploads"));
	},
	filename: (req, file, cb) => {
		// Generate unique filename with timestamp
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
	}
});

// File filter - only allow image uploads
const fileFilter = (req, file, cb) => {
	const allowedTypes = /jpeg|jpg|png|gif/;
	const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
	const mimetype = allowedTypes.test(file.mimetype);

	if (mimetype && extname) {
		return cb(null, true);
	} else {
		cb(new Error("Only image files are allowed (jpeg, jpg, png, gif)"));
	}
};

// Create multer instance
const upload = multer({
	storage: storage,
	limits: {
		fileSize: 5 * 1024 * 1024 // 5MB limit
	},
	fileFilter: fileFilter
});

export { upload };
