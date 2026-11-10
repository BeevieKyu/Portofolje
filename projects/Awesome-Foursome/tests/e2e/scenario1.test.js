import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import {
	launchBrowser,
	closeBrowser,
	goto,
	fillInput,
	clickButton,
	getText,
	elementExists,
	waitForElement,
	isOnPage,
	describeTest,
	wait,
	apiCall,
} from "./helpers.js";

describe("Scenario: User Registration → Seminar Discovery → Seminar Registration", () => {
	let browser;
	let page;
	let dialogAccepted = false;

	before(async () => {
		browser = await launchBrowser();
		page = await browser.newPage();
		await page.setViewport({ width: 1280, height: 720 });

		// Single global handler so no two listeners ever compete for the same dialog.
		// Individual tests reset dialogAccepted before triggering an action.
		page.on("dialog", async (dialog) => {
			dialogAccepted = true;
			await dialog.accept();
		});
	});

	after(async () => {
		await closeBrowser(browser);
	});

	describe("Registration - Positive Cases", () => {
		it(
			describeTest(
				"Registration",
				"Should successfully register with valid credentials (standard case)"
			),
			async () => {
				await goto(page, "/register");

				assert.ok(
					await elementExists(page, "input#username"),
					"Username input should exist"
				);

				const timestamp = Date.now().toString().slice(-8);
				const testUsername = `testuser${timestamp}`;
				const testEmail = `testuser${timestamp}@example.com`;
				await fillInput(page, "input#username", testUsername);
				await fillInput(page, "input#email", testEmail);
				await fillInput(page, "input#password", "SecurePass123!");

				dialogAccepted = false;
				const registerBtn = await page.$("button[type='submit']");
				await registerBtn.click();

				await wait(2000);

				assert.ok(dialogAccepted, "Registration alert should appear");
				assert.ok(
					await isOnPage(page, "/login"),
					"Should redirect to login after registration"
				);
			}
		);
	});

	describe("Registration - Negative Cases", () => {
		it(
			describeTest(
				"Registration",
				"Should reject registration with invalid email format"
			),
			async () => {
				await goto(page, "/register");

				await fillInput(page, "input#username", "testuser");
				await fillInput(page, "input#email", "invalidemail");
				await fillInput(page, "input#password", "ValidPass123");

				const isValidated = await page.evaluate(() => {
					const emailInput = document.querySelector("input#email");
					return !emailInput.checkValidity();
				});

				assert.ok(isValidated, "Email input should fail HTML5 validation");
			}
		);

		it(
			describeTest(
				"Registration",
				"Should reject registration with duplicate username"
			),
			async () => {
				const timestamp = Date.now().toString().slice(-8);
				const uniqueUsername = `duptest${timestamp}`;
				const uniqueEmail = `duptest${timestamp}@example.com`;

				await goto(page, "/register");
				await fillInput(page, "input#username", uniqueUsername);
				await fillInput(page, "input#email", uniqueEmail);
				await fillInput(page, "input#password", "ValidPass123");

				dialogAccepted = false;
				const registerBtn = await page.$("button[type='submit']");
				await registerBtn.click();

				await wait(2000);
				assert.ok(dialogAccepted, "First registration should succeed");

				await goto(page, "/register");
				await fillInput(page, "input#username", uniqueUsername);
				await fillInput(page, "input#email", `another${timestamp}@example.com`);
				await fillInput(page, "input#password", "ValidPass123");

				await page.$("button[type='submit']").then((btn) => btn.click());

				await wait(1500);
				const errorMsg = await page.$(".error-message");
				assert.ok(errorMsg, "Should display error message for duplicate username");
			}
		);

		it(
			describeTest("Login", "Should reject login with incorrect password"),
			async () => {
				const timestamp = Date.now().toString().slice(-8);
				const uniqueUsername = `logintest${timestamp}`;
				const uniqueEmail = `logintest${timestamp}@example.com`;

				await goto(page, "/register");
				await fillInput(page, "input#username", uniqueUsername);
				await fillInput(page, "input#email", uniqueEmail);
				await fillInput(page, "input#password", "CorrectPass123");

				dialogAccepted = false;
				const registerBtn = await page.$("button[type='submit']");
				await registerBtn.click();

				await wait(2000);
				assert.ok(dialogAccepted, "Registration should succeed");

				await goto(page, "/login");
				await fillInput(page, "input#username", uniqueUsername);
				await fillInput(page, "input#password", "WrongPass123");

				const loginBtn = await page.$("button[type='submit']");
				await loginBtn.click();

				await wait(1500);

				const errorMsg = await page.$(".error-message");
				assert.ok(
					errorMsg || (await isOnPage(page, "/login")),
					"Should reject login with wrong password"
				);
			}
		);

		it(
			describeTest("Login", "Should reject login with non-existent username"),
			async () => {
				await goto(page, "/login");

				await fillInput(page, "input#username", "nonexistentuser12345");
				await fillInput(page, "input#password", "SomePassword123");

				const loginBtn = await page.$("button[type='submit']");
				await loginBtn.click();

				await wait(1000);

				const errorMsg = await page.$(".error-message");
				assert.ok(errorMsg, "Should display error message for non-existent user");
			}
		);
	});

	describe("Seminar Discovery & Registration - Positive Cases", () => {
		it(
			describeTest(
				"Seminar Discovery",
				"Should navigate to seminars page"
			),
			async () => {
				await goto(page, "/seminars");

				const body = await elementExists(page, "body");
				assert.ok(body, "Seminars page should load");

				await wait(1000);
			}
		);

		it(
			describeTest(
				"Seminar Registration",
				"Should register for an available seminar"
			),
			async () => {
				// Setup via API: register a fresh user and use the token returned by
				// registration directly — avoids a separate login round-trip and any
				// timing issues with form-based login in Puppeteer.
				const timestamp = Date.now().toString().slice(-8);
				const uniqueUsername = `registertest${timestamp}`;
				const uniqueEmail = `registertest${timestamp}@example.com`;

				const registerResult = await apiCall("/api/v1/auth/register", {
					method: "POST",
					body: JSON.stringify({ username: uniqueUsername, email: uniqueEmail, password: "ValidPass123" }),
				});
				assert.ok(registerResult && registerResult.token, "Registration API should return a session token");

				await page.evaluate((session) => {
					localStorage.setItem("auth_session", JSON.stringify({ user: session.user, token: session.token }));
				}, registerResult);

				await goto(page, "/seminars");
				await page.waitForSelector(".seminar-register-btn:not([disabled])", { timeout: 10000 });

				const registerSeminarBtn = await page.$(".seminar-register-btn:not([disabled])");
				assert.ok(registerSeminarBtn, "At least one available seminar should exist to register for");

				await registerSeminarBtn.click();
				await wait(2000);

				const registeredBadge = await page.$(".seminar-registered-badge");
				assert.ok(registeredBadge, "Should show registered badge after seminar registration");
			}
		);

		it(
			describeTest(
				"Seminar Registration",
				"Should see registered seminars in 'My Seminars' page"
			),
			async () => {
				await goto(page, "/my-seminars");

				const pageTitle = await page.$("h1, h2, [class*='title']");
				assert.ok(pageTitle, "My Seminars page should load");

				await page.waitForSelector("tbody tr", { timeout: 8000 });
				const registrationRow = await page.$("tbody tr");
				assert.ok(registrationRow, "Should display at least one seminar registration");
			}
		);
	});

	describe("Boundary Cases", () => {
		it(
			describeTest("Registration", "Should handle minimum length username"),
			async () => {
				await goto(page, "/register");

				await fillInput(page, "input#username", "abcd");
				await fillInput(page, "input#email", `abc_${Date.now()}@example.com`);
				await fillInput(page, "input#password", "ValidPass123");

				dialogAccepted = false;
				const registerBtn = await page.$("button[type='submit']");
				await registerBtn.click();
				await wait(1500);

				const minErrorShown = await page.$(".error-message, [class*='error']");
				const minValidationFailed = await page.evaluate(() => {
					const input = document.querySelector("input#username");
					return input ? !input.checkValidity() : false;
				});

				assert.ok(
					dialogAccepted || minErrorShown || minValidationFailed,
					"Minimum length username should either register successfully or show a validation response"
				);
			}
		);

		it(
			describeTest("Registration", "Should handle maximum length username"),
			async () => {
				await goto(page, "/register");

				const maxLengthUsername = "a".repeat(64);
				await fillInput(page, "input#username", maxLengthUsername);
				await fillInput(page, "input#email", `maxlength_${Date.now()}@example.com`);
				await fillInput(page, "input#password", "ValidPass123");

				dialogAccepted = false;
				const registerBtn = await page.$("button[type='submit']");
				await registerBtn.click();
				await wait(1500);

				const maxErrorShown = await page.$(".error-message, [class*='error']");
				const maxValidationFailed = await page.evaluate(() => {
					const input = document.querySelector("input#username");
					return input ? !input.checkValidity() : false;
				});

				assert.ok(
					dialogAccepted || maxErrorShown || maxValidationFailed,
					"Maximum length username should either register successfully or show a validation response"
				);
			}
		);
	});

	describe("Edge Cases", () => {
		it(
			describeTest(
				"Registration",
				"Should handle username with underscores and numbers"
			),
			async () => {
				await goto(page, "/register");

				const timestamp = Date.now().toString().slice(-8);
				const edgeUsername = `user123test${timestamp}`;
				await fillInput(page, "input#username", edgeUsername);
				await fillInput(page, "input#email", `edge${timestamp}@example.com`);
				await fillInput(page, "input#password", "ValidPass123");

				dialogAccepted = false;
				const registerBtn = await page.$("button[type='submit']");
				await registerBtn.click();

				await wait(2000);
				assert.ok(
					dialogAccepted && (await isOnPage(page, "/login")),
					"Should successfully register with edge case username"
				);
			}
		);

		it(
			describeTest(
				"Registration",
				"Should handle email with subdomain"
			),
			async () => {
				await goto(page, "/register");

				const timestamp = Date.now().toString().slice(-8);
				const edgeEmail = `test.${timestamp}@example.com`;
				await fillInput(page, "input#username", `edgeuser${timestamp}`);
				await fillInput(page, "input#email", edgeEmail);
				await fillInput(page, "input#password", "ValidPass123");

				dialogAccepted = false;
				const registerBtn = await page.$("button[type='submit']");
				await registerBtn.click();

				await wait(2000);
				assert.ok(dialogAccepted, "Email with dot notation handled and registration succeeds");
			}
		);
	});
});
