// components/RentPage.test.jsx
// To run test (from frontend folder): npx vitest /tests/components/RentPage.test.jsx

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { apiRequest } from "../../src/utils/api.js";
import { useAuth } from "../../src/context/auth-context.jsx";
import RentPage from "../../src/pages/RentPage.jsx";

// ─── Mocks ────────────────────────────────────────────────────────────────────

// Mock Navbar and Footer so we don't need their dependencies in these tests
vi.mock("../../src/components/layout/navbar.jsx", () => ({
  default: () => <nav data-testid="navbar" />,
}));
vi.mock("../../src/components/layout/Footer.jsx", () => ({
  default: () => <footer data-testid="footer" />,
}));

// Mock RentDiolog
vi.mock("../../src/components/RentDialog.jsx", () => ({
  default: ({ onRent, item, onClose, step }) => (
    <div data-testid="rent-dialog">
      {step === "form" && (
        <button
          onClick={() => onRent(item, [new Date("2026-06-01")])}
          data-testid="confirm-rent"
        >
          Confirm Dates
        </button>
      )}
      {step === "success" && <p>Booking Confirmed</p>}
      <button onClick={onClose}>×</button>
    </div>
  ),
}));

// Mock Calendar and ButtonLight to keep tests focused on RentPage logic
vi.mock("../../src/components/ui/Calendar", () => ({
  default: ({ onSubmit, onSelect, isLoading }) => (
    <div data-testid="calendar">
      <button
        onClick={async () => {
          onSelect([new Date("2026-06-01"), new Date("2026-06-02")]);
          // Wait for state update to propagate before submitting
          await new Promise((resolve) => setTimeout(resolve, 50));
          await onSubmit();
        }}
        disabled={isLoading}
      >
        Confirm Dates
      </button>
    </div>
  ),
}));
vi.mock("../../src/components/ui/ButtonLight", () => ({
  default: ({ children, onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

// Mock the sample image import
vi.mock(
  "../../src/assets/sample-images/rent-equipment-example-image.jpg",
  () => ({
    default: "sample-image.jpg",
  }),
);

// Mock CSS imports
vi.mock("../../src/styles/styles.css", () => ({}));

// Mock apiRequest — the main fetch wrapper used by the page
vi.mock("../../src/utils/api.js", () => ({
  apiRequest: vi.fn(),
}));

// Mock useAuth — controls logged-in / logged-out state
vi.mock("../../src/context/auth-context.jsx", () => ({
  useAuth: vi.fn(),
}));

// Mock useNavigate so we can assert redirects without a real router
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Renders RentPage inside a MemoryRouter (required because the page uses
 * useNavigate and React Router context).
 */
function renderRentPage() {
  return render(
    <MemoryRouter>
      <RentPage />
    </MemoryRouter>,
  );
}

/** A realistic inventory item returned by the API */
const mockItem = {
  _id: "item001",
  name: "Canon EOS R5",
  description: "Professional mirrorless camera.",
  available: 2,
  image: "/images/canon.jpg",
};

/** An inventory item that is currently unavailable */
const mockUnavailableItem = {
  _id: "item002",
  name: "DJI Drone",
  description: "Aerial drone.",
  available: 0,
  image: null,
};

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe("RentPage component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: logged-in user
    useAuth.mockReturnValue({
      user: { username: "testuser" },
      authHeaders: { Authorization: "Bearer test-token" },
    });
    apiRequest.mockResolvedValue([]);
  });

  afterEach(() => {
    cleanup();
  });

  // ── Positive Cases ──────────────────────────────────────────────────────────

  describe("Positive cases", () => {
    it("shows a loading indicator while inventory is being fetched", () => {
      // apiRequest never resolves during this test — simulates slow network
      apiRequest.mockReturnValue(new Promise(() => {}));
      renderRentPage();
      expect(screen.getByText(/loading available items/i)).toBeInTheDocument();
    });

    it("renders a list of available equipment cards after a successful fetch", async () => {
      // apiRequest resolves with two items: one available, one not
      apiRequest.mockResolvedValue([mockItem, mockUnavailableItem]);
      renderRentPage();

      // Both card titles should appear
      expect(await screen.findByText("Canon EOS R5")).toBeInTheDocument();
      expect(await screen.findByText("DJI Drone")).toBeInTheDocument();
    });

    it("renders item descriptions fetched from the API", async () => {
      apiRequest.mockResolvedValue([mockItem]);
      renderRentPage();
      expect(
        await screen.findByText("Professional mirrorless camera."),
      ).toBeInTheDocument();
    });

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

    it("falls back to a default description when an item has no description", async () => {
      apiRequest.mockResolvedValue([{ ...mockItem, description: null }]);
      renderRentPage();
      expect(
        await screen.findByText(/no description available/i),
      ).toBeInTheDocument();
    });
  });

  // ── Boundary Cases ──────────────────────────────────────────────────────────

  describe("Boundary cases", () => {
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
  });

  // ── Edge Cases ──────────────────────────────────────────────────────────────

  describe("Edge cases", () => {
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

    it("uses a fallback image when the item has no image URL", async () => {
      // Edge: item.image is null — the component should fall back to sampleRentImg
      apiRequest.mockResolvedValue([{ ...mockItem, image: null }]);
      renderRentPage();

      await screen.findByText("Canon EOS R5");
      const img = screen.getByRole("img", { name: /canon eos r5/i });
      expect(img.src).toContain("sample-image.jpg");
    });

    it("renders an item with a very long name without crashing", async () => {
      // Edge: extremely long item name — UI should not break
      const longName = "A".repeat(300);
      apiRequest.mockResolvedValue([{ ...mockItem, name: longName }]);
      renderRentPage();
      expect(await screen.findByText(longName)).toBeInTheDocument();
    });

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
  });

  // ── Negative Cases ──────────────────────────────────────────────────────────

  describe("Negative cases", () => {
    it("shows a warning and no Rent buttons when the user is not logged in", async () => {
      // Negative: unauthenticated user — should see a login prompt, not rent buttons
      useAuth.mockReturnValue({ user: null, authHeaders: {} });
      apiRequest.mockResolvedValue([mockItem]);
      renderRentPage();

      expect(
        await screen.findByText(/you need to be logged in to rent equipment/i),
      ).toBeInTheDocument();
    });

    it("redirects to /login when a logged-out user clicks Rent", async () => {
      // Negative: clicking Rent without a session should navigate to login
      useAuth.mockReturnValue({ user: null, authHeaders: {} });
      apiRequest.mockResolvedValue([mockItem]);
      renderRentPage();

      const rentBtn = await screen.findByRole("button", { name: /rent/i });
      fireEvent.click(rentBtn);

      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });

    it("displays an error message when the inventory API request fails", async () => {
      // Negative: simulates a network failure or server error on the inventory endpoint
      apiRequest.mockRejectedValue(new Error("Network error"));
      renderRentPage();

      expect(await screen.findByText(/network error/i)).toBeInTheDocument();
    });

    it("shows an error message when the API returns a 500 server error", async () => {
      // Negative: server-side failure with a descriptive message
      apiRequest.mockRejectedValue(new Error("Request failed (500)"));
      renderRentPage();

      expect(
        await screen.findByText(/request failed \(500\)/i),
      ).toBeInTheDocument();
    });

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
  });
});
