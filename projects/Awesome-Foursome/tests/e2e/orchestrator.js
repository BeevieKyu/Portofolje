import { spawn, exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { fileURLToPath } from "url";
import { platform } from "os";

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, "../../");
const BACKEND_DIR = path.join(PROJECT_ROOT, "backend");
const FRONTEND_DIR = path.join(PROJECT_ROOT, "frontend");

const BACKEND_URL = "http://localhost:2169";
const FRONTEND_URL = "http://localhost:5173";

// Determine OS and correct npm command
const isWindows = platform() === "win32";
const NPM_CMD = isWindows ? "npm.cmd" : "npm";

let backendProcess = null;
let frontendProcess = null;

/**
 * Wait for a service to be ready by checking its URL
 */
async function waitForService(url, maxAttempts = 30, delayMs = 1000) {
	for (let i = 0; i < maxAttempts; i++) {
		try {
			const response = await fetch(url);
			if (response.ok || response.status === 404) {
				console.log(`✓ Service ready at ${url}`);
				return true;
			}
		} catch (error) {
			// Service not ready yet
		}
		await new Promise((resolve) => setTimeout(resolve, delayMs));
	}
	throw new Error(`Service at ${url} did not become ready in time`);
}

/**
 * Start backend server
 */
async function startBackend() {
	console.log("🚀 Starting backend server...");

	return new Promise((resolve, reject) => {
		backendProcess = spawn(NPM_CMD, ["run", "test:e2e:server"], {
			cwd: BACKEND_DIR,
			stdio: "inherit",
			shell: isWindows,
		});

		backendProcess.on("error", reject);

		// Give backend time to start before proceeding
		setTimeout(() => {
			waitForService(BACKEND_URL)
				.then(() => resolve())
				.catch(reject);
		}, 2000);
	});
}

/**
 * Seed the database
 */
async function seedDatabase() {
	console.log("🌱 Seeding database...");
	try {
		const { execSync } = await import("child_process");
		execSync(`${NPM_CMD} run test:e2e:seed`, {
			cwd: BACKEND_DIR,
			stdio: "inherit",
			shell: isWindows,
		});
		console.log("✓ Database seeded");
	} catch (error) {
		console.error("✗ Failed to seed database:", error.message);
		throw error;
	}
}

/**
 * Start frontend dev server
 */
async function startFrontend() {
	console.log("🚀 Starting frontend dev server...");

	return new Promise((resolve, reject) => {
		frontendProcess = spawn(NPM_CMD, ["run", "test:e2e:server"], {
			cwd: FRONTEND_DIR,
			stdio: "inherit",
			shell: isWindows,
		});

		frontendProcess.on("error", reject);

		// Give frontend time to start
		setTimeout(() => {
			waitForService(FRONTEND_URL)
				.then(() => resolve())
				.catch(reject);
		}, 3000);
	});
}

/**
 * Stop backend and frontend servers
 */
async function stopServers() {
	console.log("\n🛑 Stopping servers...");

	if (backendProcess) {
		if (isWindows) {
			backendProcess.kill("SIGKILL");
		} else {
			backendProcess.kill("SIGTERM");
		}
		await new Promise((resolve) => setTimeout(resolve, 1000));
	}

	if (frontendProcess) {
		if (isWindows) {
			frontendProcess.kill("SIGKILL");
		} else {
			frontendProcess.kill("SIGTERM");
		}
		await new Promise((resolve) => setTimeout(resolve, 1000));
	}

	console.log("✓ Servers stopped");
}

/**
 * Run all e2e tests
 */
async function runTests() {
	console.log("🧪 Running e2e tests...\n");

	try {
		// Run all test files in the e2e directory
		const testDir = path.join(__dirname);
		const { execSync } = await import("child_process");

		// Use Node's built-in test runner
		execSync(`node --test ${testDir}/*.test.js`, {
			stdio: "inherit",
			cwd: PROJECT_ROOT,
		});

		console.log("\n✓ All tests passed!");
	} catch (error) {
		console.error("\n✗ Tests failed:", error.message);
		process.exit(1);
	}
}

/**
 * Main orchestration
 */
async function main() {
	console.log("🎯 E2E Test Orchestrator\n");

	try {
		// Step 1: Start backend
		await startBackend();

		// Step 2: Seed database
		await seedDatabase();

		// Step 3: Start frontend
		await startFrontend();

		// Step 4: Run tests
		await runTests();

		// Cleanup
		await stopServers();
		process.exit(0);
	} catch (error) {
		console.error("❌ Test orchestration failed:", error.message);
		await stopServers();
		process.exit(1);
	}
}

// Handle termination signals
process.on("SIGINT", async () => {
	console.log("\n⚠️  Interrupted by user");
	await stopServers();
	process.exit(1);
});

if (!isWindows) {
	process.on("SIGTERM", async () => {
		console.log("\n⚠️  Terminated");
		await stopServers();
		process.exit(1);
	});
}

main();
