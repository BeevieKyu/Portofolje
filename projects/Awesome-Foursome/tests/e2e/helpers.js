import puppeteer from "puppeteer";

const FRONTEND_URL = "http://localhost:5173"; // Vite default port
const BACKEND_URL = "http://localhost:2169";

/**
 * Wait for a specified time in milliseconds
 */
export async function wait(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Launch a Puppeteer browser instance
 */
export async function launchBrowser() {
	return await puppeteer.launch({
		headless: true,
		args: ["--no-sandbox", "--disable-setuid-sandbox"],
	});
}

/**
 * Close browser and cleanup
 */
export async function closeBrowser(browser) {
	if (browser) {
		await browser.close();
	}
}

/**
 * Navigate to the frontend URL
 */
export async function goto(page, path = "/") {
	await page.goto(`${FRONTEND_URL}${path}`, { waitUntil: "networkidle2" });
}

/**
 * Fill an input field by selector (more reliable than keyboard simulation)
 */
export async function fillInput(page, selector, value) {
	// Focus on the input
	await page.focus(selector);
	
	// Clear existing value using backspace
	await page.evaluate((sel) => {
		const element = document.querySelector(sel);
		if (element) {
			element.value = '';
			element.dispatchEvent(new Event('input', { bubbles: true }));
		}
	}, selector);
	
	// Type the new value
	await page.type(selector, value, { delay: 10 });
}

/**
 * Click a button by text or selector
 */
export async function clickButton(page, textOrSelector) {
	// Try by text first
	const button = await page.$(`button:has-text("${textOrSelector}")`);
	if (button) {
		await button.click();
	} else {
		// Fall back to selector
		await page.click(textOrSelector);
	}
	await page.waitForNavigation({ waitUntil: "networkidle2" }).catch(() => {});
}

/**
 * Get text content of an element
 */
export async function getText(page, selector) {
	return await page.$eval(selector, (el) => el.textContent);
}

/**
 * Check if element exists on page
 */
export async function elementExists(page, selector) {
	return (await page.$(selector)) !== null;
}

/**
 * Wait for an element to appear on the page
 */
export async function waitForElement(page, selector, timeout = 5000) {
	await page.waitForSelector(selector, { timeout });
}

/**
 * Check if we're on a specific page (by URL path)
 */
export async function isOnPage(page, path) {
	const url = page.url();
	return url.includes(path);
}

/**
 * Get current URL
 */
export async function getCurrentUrl(page) {
	return page.url();
}

/**
 * Make API call directly (useful for cleanup/setup)
 */
export async function apiCall(endpoint, options = {}) {
	const response = await fetch(`${BACKEND_URL}${endpoint}`, {
		headers: { "Content-Type": "application/json", ...options.headers },
		...options,
	});

	if (!response.ok) {
		throw new Error(`API call failed: ${response.status} ${response.statusText}`);
	}

	return await response.json();
}

/**
 * Register a test user via API (for setup/cleanup)
 */
export async function registerTestUser(username, email, password) {
	try {
		return await apiCall("/api/v1/auth/register", {
			method: "POST",
			body: JSON.stringify({ username, email, password }),
		});
	} catch (error) {
		console.log(`User ${username} may already exist:`, error.message);
		return null;
	}
}

/**
 * Format test description with context
 */
export function describeTest(category, testName) {
	return `[${category}] ${testName}`;
}
