// Main Express server configuration and startup
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB, disconnectDB } from "./configs/db.config.js";
import apiV1Router from "./routers/api.v1.router.js";
import { globalErrorHandler } from "./middleware/errorHandler.js";
import { runAllSeeds } from "./seeds/runAllSeeds.js";

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

await connectDB(); // Connect to MongoDB on startup
await runAllSeeds(); // Seed database with initial data if empty

const app = express();
const PORT = process.env.PORT || 5000; // Server port from env or default to 5000

// CORS whitelist - only these origins can access the API
const allowedOrigins = [
    process.env.FRONTEND_URL || "http://localhost:9001",
    "http://localhost:5173",      // Vite dev server
    "http://localhost:3000",       // Alternative local dev
    "http://frontend.app:5173",    // Docker compose network
];

app.use(express.json()); // Parse incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use((req, res, next) => { // CORS middleware - restrict requests to allowed origins only
    const origin = req.headers.origin;
    
    // Only set CORS header if origin is in whitelist
    if (allowedOrigins.includes(origin)) {
        res.header("Access-Control-Allow-Origin", origin);
    }
    
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Credentials", "true");
    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }
    return next();
});

// Serve uploaded files as static assets
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/v1", apiV1Router);

app.get("/", (req, res) => {
    res.send("Hello world");
});

app.use(globalErrorHandler);

const server = app.listen(PORT, () => console.log("Our backend-app is listening on port", PORT));

async function shutDown(){
    console.log("\nThe backend-app is shutting down...");
    await disconnectDB();
    server.close(()=>{
        process.exit(0);
    });
}

process.on("SIGINT", shutDown);
process.on("SIGTERM", shutDown);