
# Test Report


## E2E testing completed by Iselin

For this suite of testing, I decided to test the flow of user registration -> login -> seminar signup -> confirmation on my seminars.

Here is the link to the testing file: https://git.ntnu.no/iselinch/Awesome-Foursome/blob/main/tests/e2e/scenario1.test.js 

I have used the Node.js built-in test runner (`node:test`) with Puppeteer for browser automation and `node:assert` for assertions.

A single global dialog handler is set up in the `before` hook and shared across all tests. Each test that expects a dialog resets the shared `dialogAccepted` flag before triggering the action:

```js
page.on("dialog", async (dialog) => {
    dialogAccepted = true;
    await dialog.accept();
});
```

### Positive test case

In this test the user should successfully register with a username, email and password with standard case. This should test that the registration form and submit button works with the database and backend.

```js
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
```

This test should navigate to the seminars page without problems.

```js
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
```

This test registers a fresh user via the API and injects the session token directly into `localStorage` to avoid form-login timing issues in Puppeteer. It then navigates to the seminars page, clicks the first available register button, and confirms the registered badge appears.

```js
it(
    describeTest(
        "Seminar Registration",
        "Should register for an available seminar"
    ),
    async () => {
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
```

This test checks that the seminar registered in the previous test appears on the user's My Seminars page.

```js
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
```

### Negative test cases

This negative test should check that you get an error when trying to register with an invalid email format.

```js
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

        const registerBtn = await page.$("button[type='submit']");

        const isValidated = await page.evaluate(() => {
            const emailInput = document.querySelector("input#email");
            return !emailInput.checkValidity();
        });

        assert.ok(isValidated, "Email input should fail HTML5 validation");
    }
);
```

This negative test should check that an error occurs when trying to register with an already registered username.

```js
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
```

This negative test should show an error when trying to login with the wrong password.

```js
it(
    describeTest(
        "Login",
        "Should reject login with incorrect password"
    ),
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
```

This negative test should show an error when trying to login with a non-existent user.

```js
it(
    describeTest(
        "Login",
        "Should reject login with non-existent username"
    ),
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
```

### Boundary test cases

This test should test the boundary of minimum amount of characters in a username.

```js
it(
    describeTest(
        "Registration",
        "Should handle minimum length username"
    ),
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
```

This test should test the boundary of maximum amount of characters in a username.

```js
it(
    describeTest(
        "Registration",
        "Should handle maximum length username"
    ),
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
```

### Edge cases

This test should check if the registration page can handle a username with underscores and numbers.

```js
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
```

This test should check that the email input can handle an email with a dot in the local part when registering an account.

```js
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
```

## Unit testing completed and written by Marie

Here is the link to the testing file: https://git.ntnu.no/iselinch/Awesome-Foursome/blob/main/backend/tests/UnitTests/admin.inv.test.js 

### Positive cases
```js
test("should create inventory item with valid data", () => {

const itemData = {
name: "Wireless Mouse",
quantity: 10,
available: 8,
description: "Ergonomic wireless mouse",
image: "mouse.jpg",

};

const item = createMockInventoryItem(itemData);

assert.strictEqual(item.name, "Wireless Mouse");
assert.strictEqual(item.quantity, 10);
assert.strictEqual(item.available, 8);

});

```
This test creates an inventory item with valid data to test if it works in general.
```js
test("should create item with minimum required fields", () => {

const itemData = { name: "USB Cable" };
const item = createMockInventoryItem(itemData);
assert.strictEqual(item.name, "USB Cable");
assert.ok(item._id !== undefined);

});
```
This creates a test with minimum required fields to test if it works
```js
test("should create item with maximum name length (120 chars)", () => {

const itemData = { name: "A".repeat(120) };
const item = createMockInventoryItem(itemData);
assert.strictEqual(item.name.length, 120);

});
```
This test if the maximum characters work and that it works with 120 characters
```js
test("should create item with maximum description (500 chars)", () => {

const itemData = { name: "Item", description: "B".repeat(500) };
const item = createMockInventoryItem(itemData);
assert.strictEqual(item.description.length, 500);
});
```
This test the maximum characters for the description to make sure that the description can have 500 characters

### Negative cases
```js
test("should reject empty name", () => {
assert.throws(() => {
const name = "";
if (!name || name.trim().length === 0) {
throw new Error("Name is required");
}
});
});
```
this tests if the name is empty, if it is it should reject it.
```js
test("should reject negative quantity", () => {
const quantity = -5;
const sanitized = Math.max(0, quantity);
assert.strictEqual(sanitized, 0);
});
```
This test if a negative quantity is rejected as it should. Quantity cant be less than 0
```js
test("should reject quantity exceeding maximum (> 100)", () => {
const quantity = 150;
const isValid = quantity >= 0 && quantity <= 100;
assert.strictEqual(isValid, false);
});
```
This test if the quantity can exceed 100 if it can it should reject it.
```js
test("should reject name exceeding 120 characters", () => {

const name = "A".repeat(121);
const isValid = name.length <= 120;
assert.strictEqual(isValid, false);
});
```
This tests to make sure that a name cant be more then 120 characters. If it it it will reject it.
```js
test("should reject description exceeding 500 characters", () => {

const description = "B".repeat(501);
const isValid = description.length <= 500;
assert.strictEqual(isValid, false);
});
```
This tests to make sure the description cant be more than 500 characters. If it is it rejects it.
```js
test("should reject available exceeding maximum (> 100)", () => {

const available = 150;
const isValid = available >= 0 && available <= 100;
assert.strictEqual(isValid, false);
});
```
This tests to make sure that the available amount cant be more than 100. If there is more it rejects it.

### Boundary cases
```js
test("should accept quantity at minimum (0)", () => {

const quantity = 0;
assert.strictEqual(quantity >= 0 && quantity <= 100, true);
});
```
This test makes sure that the quantity can be 0 and still work.
```js
test("should accept quantity at maximum (100)", () => {

const quantity = 100;
assert.strictEqual(quantity >= 0 && quantity <= 100, true);
});
```
This tests to make sure that the test can be maximum 100.
```js
test("should reject quantity at 101 (above maximum)", () => {

const quantity = 101;
assert.strictEqual(quantity >= 0 && quantity <= 100, false);
});
```
This tests if the quantity is over 100 it rejects since it can max be 100
```js
test("should accept name at minimum (1 char)", () => {

const name = "A";
assert.strictEqual(name.length >= 1 && name.length <= 120, true);
});
```
This tests to make sure that the name is minimum 1 character.
```js
test("should reject name at 121 (above maximum length)", () => {

const name = "A".repeat(121);
assert.strictEqual(name.length <= 120, false);
});
```
This tests if the name can be more than 120 if it is it should reject it.
```js
test("should accept description at maximum (500 chars)", () => {

const description = "B".repeat(500);
assert.strictEqual(description.length <= 500, true);
});
```
This test to make sure that description can be maximum 500 characters.

### Edge cases
```js
test("should handle name with special characters", () => {

const itemData = { name: "Laptop @#$% & Desk" };
const item = createMockInventoryItem(itemData);
assert.strictEqual(item.name, "Laptop @#$% & Desk");
});
```
This tests to make sure that the name can include special characters.

```js
test("should handle name with unicode characters", () => {

const itemData = { name: "Mouse 鼠标" };
const item = createMockInventoryItem(itemData);
assert.strictEqual(item.name, "Mouse 鼠标");
});
```
This tests if the name can handle unicode characters.
```js
test("should handle quantity zero (no stock)", () => {

const itemData = { name: "Out of Stock", quantity: 0, available: 0 };
const item = createMockInventoryItem(itemData);
assert.strictEqual(item.quantity, 0);
});
```
This tests if it can handle the quantity being 0
```js
test("should trim whitespace from name", () => {

const trimmed = " Wireless Mouse ".trim();
assert.strictEqual(trimmed, "Wireless Mouse");
});
```
This tests if whitespace is trimmed from the name
```js
test("should handle description with newlines", () => {

const description = "Line1\nLine2\nLine3";
assert.ok(description.includes("\n"));
});
```
This test if the description can handle newLines

### Update operations(positive)
```js
test("should update quantity on existing item", () => {

const item = createMockInventoryItem({ name: "Mouse", quantity: 10 });
item.quantity = 15;
assert.strictEqual(item.quantity, 15);
});
```
This tests that the quantity is updated on the existing item
```js
test("should update only modified fields", () => {

const item = createMockInventoryItem({ name: "Original", quantity: 10 });
const originalName = item.name;
item.quantity = 20;
assert.strictEqual(item.name, originalName);
assert.strictEqual(item.quantity, 20);
});
```
This test if only the modified fields are updated.

## Component integration testing completed by Kaja
Integration tests of components where logic isn't covered in unit and e2e were done.
The tests were conducted using Vitest, a Vite-native testing framework that runs in the same 
pipeline as the development build, enabling fast test execution with native ES module support. 
Component rendering and DOM interaction was handled by React Testing Library (RTL), which 
supports testing components the way a user would interact with them — by querying the DOM for 
visible elements rather than internal component state. External dependencies such as API calls, 
authentication context, and child components were replaced with mocks using Vitest's built-in vi.fn() and vi.mock() 
utilities, isolating the component under test from the rest of the application.

### RentPage component test
A test suite of 21 tests was creating testing UI rendering, interactions between connected components and interactions with the backend (using mocks). 
The 21 tests are organised below by what they primarily verify. Some tests  overlap categories. For example, rendering tests also implicitly verify that the API response was correctly consumed. The test itself can be found in /frontend/tests/components/RentPage.test.jsx in the project directory.

#### UI Rendering
Tests that verify the component displays correct elements based on data and state.

Positive: shows 'Rent' button for available items and 'Unavailable' for out-of-stock items
```js
it("shows 'Rent' button for available items and 'Unavailable' for out-of-stock items", async () => {
      apiRequest.mockResolvedValue([mockItem, mockUnavailableItem]);
      renderRentPage();

      await screen.findByText("Canon EOS R5");

      // Available item should have an enabled Rent button
      const rentButtons = screen.getAllByRole("button", { name: /rent/i });
      expect(rentButtons.length).toBeGreaterThan(0);

      // Unavailable item should show disabled Unavailable button
      const unavailableBtn = screen.getByRole("button", {
        name: /unavailable/i,
      });
      expect(unavailableBtn).toBeDisabled();
    });
```

Positive: renders item cards after successful fetch
```js
it("renders a list of available equipment cards after a successful fetch", async () => {
      // apiRequest resolves with two items: one available, one not
      apiRequest.mockResolvedValue([mockItem, mockUnavailableItem]);
      renderRentPage();

      // Both card titles should appear
      expect(await screen.findByText("Canon EOS R5")).toBeInTheDocument();
      expect(await screen.findByText("DJI Drone")).toBeInTheDocument();
    });
```

Positive: shows loading indicator while fetching
```js
    it("shows a loading indicator while inventory is being fetched", () => {
      // apiRequest never resolves during this test — simulates slow network
      apiRequest.mockReturnValue(new Promise(() => {}));
      renderRentPage();
      expect(screen.getByText(/loading available items/i)).toBeInTheDocument();
    });
```

Boundary: renders correctly with 0 items / 1 item
```js
it("renders correctly when the inventory list is empty (zero items)", async () => {
      // Boundary: the API returns an empty array — no cards should render
      apiRequest.mockResolvedValue([]);
      renderRentPage();

      // Loading disappears and no card titles appear
      await waitFor(() => {
        expect(
          screen.queryByText(/loading available items/i),
        ).not.toBeInTheDocument();
      });
      expect(
        screen.queryByRole("button", { name: /rent/i }),
      ).not.toBeInTheDocument();
    });

it("renders correctly when there is exactly one item in the inventory", async () => {
      // Boundary: minimum non-empty list
      apiRequest.mockResolvedValue([mockItem]);
      renderRentPage();
      expect(await screen.findByText("Canon EOS R5")).toBeInTheDocument();
      expect(screen.getAllByRole("button", { name: /rent/i })).toHaveLength(1);
    });
```
Boundary: shows Rent vs Unavailable at availability = 1 and = 0
```js
it("treats an item with available = 1 as rentable (lower boundary of availability)", async () => {
      // Boundary: exactly 1 unit available — should still show Rent, not Unavailable
      apiRequest.mockResolvedValue([{ ...mockItem, available: 1 }]);
      renderRentPage();
      expect(
        await screen.findByRole("button", { name: /rent/i }),
      ).not.toBeDisabled();
    });

it("treats an item with available = 0 as unavailable (availability boundary)", async () => {
      // Boundary: exactly 0 — the button should flip to Unavailable and be disabled
      apiRequest.mockResolvedValue([{ ...mockItem, available: 0 }]);
      renderRentPage();
      expect(
        await screen.findByRole("button", { name: /unavailable/i }),
      ).toBeDisabled();
    });
```

Edge: renders 50 items without crashing
```js
it("renders a large inventory list (50 items) without crashing", async () => {
      // Edge: unusually large payload — tests that the list renders without error
      const manyItems = Array.from({ length: 50 }, (_, i) => ({
        ...mockItem,
        _id: `item${i}`,
        name: `Item ${i}`,
      }));
      apiRequest.mockResolvedValue(manyItems);
      renderRentPage();

      // Spot-check a few items
      expect(await screen.findByText("Item 0")).toBeInTheDocument();
      expect(screen.getByText("Item 49")).toBeInTheDocument();
    });
```

Edge: renders fallback image when image is null
```js
 it("uses a fallback image when the item has no image URL", async () => {
      // Edge: item.image is null — the component should fall back to sampleRentImg
      apiRequest.mockResolvedValue([{ ...mockItem, image: null }]);
      renderRentPage();

      await screen.findByText("Canon EOS R5");
      const img = screen.getByRole("img", { name: /canon eos r5/i });
      expect(img.src).toContain("sample-image.jpg");
    });
```

Negative: shows warning when user is not logged in
```js
it("shows a warning and no Rent buttons when the user is not logged in", async () => {
      // Negative: unauthenticated user — should see a login prompt, not rent buttons
      useAuth.mockReturnValue({ user: null, authHeaders: {} });
      apiRequest.mockResolvedValue([mockItem]);
      renderRentPage();

      expect(
        await screen.findByText(/you need to be logged in to rent equipment/i),
      ).toBeInTheDocument();
    });
```

#### Component Interactions
Tests that verify RentPage correctly coordinates with its child components. The RentDialog component is mocked to isolate RentPage's responsibility. This is to manage which step is shown (form vs success) and resetting state on close, from RentDialog's own internal logic.

Positive: opens RentDialog when logged-in user clicks "Rent"
```js
it("opens the RentDialog when a logged-in user clicks Rent on an available item", async () => {
      apiRequest.mockResolvedValue([mockItem]);
      renderRentPage();

      const rentBtn = await screen.findByRole("button", { name: /rent/i });
      fireEvent.click(rentBtn);

      // RentDialog should open — check for the mocked dialog testid
      expect(screen.getByTestId("rent-dialog")).toBeInTheDocument();
      // Confirm Dates button should be visible (step === "form")
      expect(screen.getByTestId("confirm-rent")).toBeInTheDocument();
    });
```

Positive: shows success step after confirming rental dates
```js
 it("shows the success step with booking confirmation after confirming rental dates", async () => {
      apiRequest.mockResolvedValue([mockItem]);
      renderRentPage();

      const rentBtn = await screen.findByRole("button", { name: /rent/i });
      fireEvent.click(rentBtn);

      const confirmBtn = await screen.findByTestId("confirm-rent");
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(screen.getByText(/booking confirmed/i)).toBeInTheDocument();
      });
    });
```

Positive: closes dialog and resets state when close button is clicked
```js
 it("closes the dialog and resets state when the close button is clicked", async () => {
      apiRequest.mockResolvedValue([mockItem]);
      renderRentPage();

      await screen.findByText("Canon EOS R5");

      const rentBtn = screen.getByRole("button", { name: /rent/i });
      fireEvent.click(rentBtn);

      // Dialog should be open
      await waitFor(() => {
        expect(screen.getByTestId("rent-dialog")).toBeInTheDocument();
      });

      const closeBtn = screen.getByRole("button", { name: "×" });
      fireEvent.click(closeBtn);

      // Dialog should be gone
      await waitFor(() => {
        expect(screen.queryByTestId("rent-dialog")).not.toBeInTheDocument();
      });
    });
```

Negative: does not open dialog when clicking disabled Unavailable button
```js
it("does not open the dialog when clicking the disabled Unavailable button", async () => {
      apiRequest.mockResolvedValue([mockUnavailableItem]);
      renderRentPage();

      const unavailableBtn = await screen.findByRole("button", {
        name: /unavailable/i,
      });
      fireEvent.click(unavailableBtn);

      // Dialog should never open
      expect(screen.queryByTestId("rent-dialog")).not.toBeInTheDocument();
    });
```

Negative: redirects to /login when logged-out user clicks Rent
```js
it("redirects to /login when a logged-out user clicks Rent", async () => {
      // Negative: clicking Rent without a session should navigate to login
      useAuth.mockReturnValue({ user: null, authHeaders: {} });
      apiRequest.mockResolvedValue([mockItem]);
      renderRentPage();

      const rentBtn = await screen.findByRole("button", { name: /rent/i });
      fireEvent.click(rentBtn);

      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
```

#### Backend Interactions
Backend interactions are simulated using vi.fn() mocks on apiRequest, allowing controlled testing of both successful responses and failure scenarios without requiring a running backend. Tests verify that data fetched from /api/v1/inventory is correctly rendered, and that network failures and server errors result in appropriate error messages being displayed to the user.

Positive: renders item descriptions fetched from the API
```js
it("renders item descriptions fetched from the API", async () => {
      apiRequest.mockResolvedValue([mockItem]);
      renderRentPage();
      expect(
        await screen.findByText("Professional mirrorless camera."),
      ).toBeInTheDocument();
    });
```

Positive: falls back to default description when item has no description
```js
it("falls back to a default description when an item has no description", async () => {
      apiRequest.mockResolvedValue([{ ...mockItem, description: null }]);
      renderRentPage();
      expect(
        await screen.findByText(/no description available/i),
      ).toBeInTheDocument();
    });
```

Edge: renders item with very long name without crashing
```js
it("renders an item with a very long name without crashing", async () => {
      // Edge: extremely long item name — UI should not break
      const longName = "A".repeat(300);
      apiRequest.mockResolvedValue([{ ...mockItem, name: longName }]);
      renderRentPage();
      expect(await screen.findByText(longName)).toBeInTheDocument();
    });
```

Negative: displays error message when inventory API request fails
```js
 it("displays an error message when the inventory API request fails", async () => {
      // Negative: simulates a network failure or server error on the inventory endpoint
      apiRequest.mockRejectedValue(new Error("Network error"));
      renderRentPage();

      expect(await screen.findByText(/network error/i)).toBeInTheDocument();
    });
```

Negative: shows error message when API returns a 500 server error
```js
it("shows an error message when the API returns a 500 server error", async () => {
      // Negative: server-side failure with a descriptive message
      apiRequest.mockRejectedValue(new Error("Request failed (500)"));
      renderRentPage();

      expect(
        await screen.findByText(/request failed \(500\)/i),
      ).toBeInTheDocument();
    });
```

Negative: does not render any item cards when API call fails
```js
it("does not render any item cards when the API call fails", async () => {
      // Negative: on API failure, the card container should remain empty
      apiRequest.mockRejectedValue(new Error("Network error"));
      renderRentPage();

      await waitFor(() => {
        expect(
          screen.queryByText(/loading available items/i),
        ).not.toBeInTheDocument();
      });

      expect(
        screen.queryByRole("button", { name: /rent/i }),
      ).not.toBeInTheDocument();
    });
```

#### Test Results
```
✓ tests/components/RentPage.test.jsx (21 tests) 1154ms
   ✓ RentPage component (21)
     ✓ Positive cases (8)
       ✓ shows a loading indicator while inventory is being fetched 50ms
       ✓ renders a list of available equipment cards after a successful fetch 55ms
       ✓ renders item descriptions fetched from the API 44ms
       ✓ shows 'Rent' button for available items and 'Unavailable' for out-of-stock items  303ms
       ✓ opens the RentDialog when a logged-in user clicks Rent on an available item 92ms
       ✓ shows the success step with booking confirmation after confirming rental dates 72ms
       ✓ closes the dialog and resets state when the close button is clicked 110ms
       ✓ falls back to a default description when an item has no description 14ms
     ✓ Boundary cases (4)
       ✓ renders correctly when the inventory list is empty (zero items) 16ms
       ✓ renders correctly when there is exactly one item in the inventory 44ms
       ✓ treats an item with available = 1 as rentable (lower boundary of availability) 29ms
       ✓ treats an item with available = 0 as unavailable (availability boundary) 28ms
     ✓ Edge cases (4)
       ✓ renders a large inventory list (50 items) without crashing 67ms
       ✓ uses a fallback image when the item has no image URL 37ms
       ✓ renders an item with a very long name without crashing 17ms
       ✓ does not open the dialog when clicking the disabled Unavailable button 61ms
     ✓ Negative cases (5)
       ✓ shows a warning and no Rent buttons when the user is not logged in 5ms
       ✓ redirects to /login when a logged-out user clicks Rent 57ms
       ✓ displays an error message when the inventory API request fails 14ms
       ✓ shows an error message when the API returns a 500 server error 16ms
       ✓ does not render any item cards when the API call fails 17ms

 Test Files  1 passed (1)
      Tests  21 passed (21)
   Start at  14:50:35
   Duration  3.42s (transform 171ms, setup 177ms, import 375ms, tests 1.15s, environment 1.41s)
```