// API routes - defines all endpoints for the application
import { Router } from "express";
import { validate } from "../validators/validate.js"; // Middleware to handle validation errors
import { requireAdmin, requireUser } from "../middleware/auth.js"; // Middleware to protect routes
import { upload } from "../middleware/upload.js"; // Multer upload middleware

import authController from "../controllers/auth.controller.js";
import { validateLogin, validateRegister } from "../validators/user.validator.js";

import inventoryController from "../controllers/inventory.controller.js";
import { validateInventoryId, validateInventoryItem } from "../validators/inventory.validator.js";

import seminarController from "../controllers/seminar.controller.js";
import { validateSeminarId, validateSeminar } from "../validators/seminar.validator.js";

import usersController from "../controllers/users.controller.js";
import newsController from "../controllers/news.controller.js";

import researchController from "../controllers/research.controller.js";

const router = Router();

// --- AUTH ENDPOINTS ---
router.post("/auth/login", validateLogin(), validate, authController.login); // User login
router.post("/auth/register", validateRegister(), validate, authController.register); // User registration

// --- INVENTORY ENDPOINTS ---
router.get("/inventory", inventoryController.getInventory); // List all equipment
router.post("/inventory", requireAdmin, upload.single("image"), validateInventoryItem(), validate, inventoryController.createInventoryItem); // Create item with photo
router.patch("/inventory/:id", requireAdmin, upload.single("image"), validateInventoryId(), validate, inventoryController.updateInventoryItem); // Update item with photo
router.delete("/inventory/:id", requireAdmin, validateInventoryId(), validate, inventoryController.deleteInventoryItem); // Delete item

// --- SEMINAR ENDPOINTS ---
router.get("/seminars", seminarController.getSeminars); // List all seminars
router.get("/seminars/:id", seminarController.getSeminar); // Get single seminar with capacity
router.post("/seminars", requireAdmin, upload.single("image"), validateSeminar(), validate, seminarController.createSeminar); // Create seminar with photo
router.patch("/seminars/:id", requireAdmin, upload.single("image"), validateSeminarId(), validate, seminarController.updateSeminar); // Update seminar with photo
router.delete("/seminars/:id", requireAdmin, validateSeminarId(), validate, seminarController.deleteSeminar); // Delete seminar

// --- NEWS ENDPOINTS ---
router.get("/news", newsController.getNews); // Fetch news via SerpAPI

// --- USER RENTAL & REGISTRATION ENDPOINTS ---
router.get("/rentals/admin/all", requireAdmin, usersController.getAllRentals); // Get all rentals (admin only)
router.post("/rentals", requireUser, usersController.createRental); // Create rental request
router.get("/users/:uid/rentals", requireUser, usersController.getRentals); // Get user's rental history
router.delete("/rentals/:rentalIndex", requireUser, usersController.cancelRental); // Cancel rental
router.post("/seminars/:id/register", requireUser, usersController.registerSeminar); // Register for seminar
router.get("/users/:uid/seminars", requireUser, usersController.getSeminarRegistrations); // Get user's seminar registrations
router.delete("/seminars/:seminarIndex/unregister", requireUser, usersController.withdrawFromSeminar); // Withdraw from seminar

// --- RESEARCH ENDPOINTS ---
router.get("/research", researchController.getResearchProjects); // List all research projects
router.get("/research/:id", researchController.getResearchProject); // Get single research project
router.post("/research", requireAdmin, researchController.createResearchProject); // Create research (admin)
router.patch("/research/:id", requireAdmin, researchController.updateResearchProject); // Update research (admin)
router.delete("/research/:id", requireAdmin, researchController.deleteResearchProject); // Delete research (admin)

// --- RESEARCHER ENDPOINTS ---
router.get("/researchers", researchController.getResearchers); // List all researchers
router.get("/researchers/:id", researchController.getResearcher); // Get researcher profile
router.post("/researchers", requireAdmin, researchController.createResearcher); // Create researcher (admin)
router.patch("/researchers/:id", requireAdmin, researchController.updateResearcher); // Update researcher (admin)
router.delete("/researchers/:id", requireAdmin, researchController.deleteResearcher); // Delete researcher (admin)

export default router;
