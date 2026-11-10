/**
 * Utility functions for authentication and guest ID management
 */

/**
 * Gets or generates a guest ID from session storage
 * @returns {string} Guest ID
 */
export function getGuestId() {
  let id = sessionStorage.getItem("guestId");
  if (!id) {
    id = "anon-" + Math.random().toString(36).slice(2, 10);
    sessionStorage.setItem("guestId", id);
  }
  return id;
}
