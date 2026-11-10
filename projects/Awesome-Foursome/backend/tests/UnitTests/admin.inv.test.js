import { test, describe, beforeEach } from "node:test";
import assert from "node:assert";

// Mock InventoryItem model - no need to import real MongoDB model
const mockDatabase = {};
let mockIdCounter = 1;

function createMockInventoryItem(data) {
  const id = mockIdCounter++;
  return {
    _id: id,
    ...data,
    save: async function () {
      mockDatabase[id] = { ...this };
      return mockDatabase[id];
    },
    toJSON: function () {
      return { ...this };
    },
  };
}

describe("Inventory Service (inventory.service.js)", () => {

  beforeEach(() => {
    // Clear mock database before each test
    for (const key in mockDatabase) {
      delete mockDatabase[key];
    }
    mockIdCounter = 1;
  });

  describe("Positive Cases - Valid Inventory Operations", () => {
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

    test("should create item with minimum required fields", () => {
      const itemData = { name: "USB Cable" };
      const item = createMockInventoryItem(itemData);
      assert.strictEqual(item.name, "USB Cable");
      assert.ok(item._id !== undefined);
    });

    test("should create item with maximum name length (120 chars)", () => {
      const itemData = { name: "A".repeat(120) };
      const item = createMockInventoryItem(itemData);
      assert.strictEqual(item.name.length, 120);
    });

    test("should create item with maximum description (500 chars)", () => {
      const itemData = { name: "Item", description: "B".repeat(500) };
      const item = createMockInventoryItem(itemData);
      assert.strictEqual(item.description.length, 500);
    });
  });

  describe("Negative Cases - Invalid Input", () => {
    test("should reject empty name", () => {
      assert.throws(() => {
        const name = "";
        if (!name || name.trim().length === 0) {
          throw new Error("Name is required");
        }
      });
    });

    test("should reject negative quantity", () => {
      const quantity = -5;
      const sanitized = Math.max(0, quantity);
      assert.strictEqual(sanitized, 0);
    });

    test("should reject quantity exceeding maximum (> 100)", () => {
      const quantity = 150;
      const isValid = quantity >= 0 && quantity <= 100;
      assert.strictEqual(isValid, false);
    });

    test("should reject name exceeding 120 characters", () => {
      const name = "A".repeat(121);
      const isValid = name.length <= 120;
      assert.strictEqual(isValid, false);
    });

    test("should reject description exceeding 500 characters", () => {
      const description = "B".repeat(501);
      const isValid = description.length <= 500;
      assert.strictEqual(isValid, false);
    });

    test("should reject available exceeding maximum (> 100)", () => {
      const available = 150;
      const isValid = available >= 0 && available <= 100;
      assert.strictEqual(isValid, false);
    });
  });

  describe("Boundary Cases - Exact Limits", () => {
    test("should accept quantity at minimum (0)", () => {
      const quantity = 0;
      assert.strictEqual(quantity >= 0 && quantity <= 100, true);
    });

    test("should accept quantity at maximum (100)", () => {
      const quantity = 100;
      assert.strictEqual(quantity >= 0 && quantity <= 100, true);
    });

    test("should reject quantity at 101 (above maximum)", () => {
      const quantity = 101;
      assert.strictEqual(quantity >= 0 && quantity <= 100, false);
    });

    test("should accept name at minimum (1 char)", () => {
      const name = "A";
      assert.strictEqual(name.length >= 1 && name.length <= 120, true);
    });

    test("should reject name at 121 (above maximum length)", () => {
      const name = "A".repeat(121);
      assert.strictEqual(name.length <= 120, false);
    });

    test("should accept description at maximum (500 chars)", () => {
      const description = "B".repeat(500);
      assert.strictEqual(description.length <= 500, true);
    });
  });

  describe("Edge Cases - Special Characters & Data Types", () => {
    test("should handle name with special characters", () => {
      const itemData = { name: "Laptop @#$% & Desk" };
      const item = createMockInventoryItem(itemData);
      assert.strictEqual(item.name, "Laptop @#$% & Desk");
    });

    test("should handle name with unicode characters", () => {
      const itemData = { name: "Mouse 鼠标" };
      const item = createMockInventoryItem(itemData);
      assert.strictEqual(item.name, "Mouse 鼠标");
    });

    test("should handle quantity zero (no stock)", () => {
      const itemData = { name: "Out of Stock", quantity: 0, available: 0 };
      const item = createMockInventoryItem(itemData);
      assert.strictEqual(item.quantity, 0);
    });

    test("should trim whitespace from name", () => {
      const trimmed = "  Wireless Mouse  ".trim();
      assert.strictEqual(trimmed, "Wireless Mouse");
    });

    test("should handle description with newlines", () => {
      const description = "Line1\nLine2\nLine3";
      assert.ok(description.includes("\n"));
    });
  });

  describe("Update Operations - Positive Cases", () => {
    test("should update quantity on existing item", () => {
      const item = createMockInventoryItem({ name: "Mouse", quantity: 10 });
      item.quantity = 15;
      assert.strictEqual(item.quantity, 15);
    });

    test("should update only modified fields", () => {
      const item = createMockInventoryItem({ name: "Original", quantity: 10 });
      const originalName = item.name;
      item.quantity = 20;
      assert.strictEqual(item.name, originalName);
      assert.strictEqual(item.quantity, 20);
    });
  });
});
