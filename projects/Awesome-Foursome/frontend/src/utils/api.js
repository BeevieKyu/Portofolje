// API request utility - handles all communication with backend
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:2169"; // Backend URL from env or default

// Helper function to make fetch requests to the backend API
export async function apiRequest(path, options = {}) {
    // Extract and merge headers properly to avoid overwriting
    const { headers: customHeaders, ...otherOptions } = options;
    
    // Check if body is FormData (for file uploads)
    const isFormData = otherOptions.body instanceof FormData;
    
    const finalOptions = {
        headers: {
            ...(isFormData ? {} : { "Content-Type": "application/json" }), // Don't set Content-Type for FormData
            ...(customHeaders || {}), // Merge custom headers (e.g., user auth headers)
        },
        ...otherOptions, // Spread other options but NOT headers
    };

    console.log("[DEBUG API] Request to:", `${API_BASE_URL}${path}`);
    console.log("[DEBUG API] Final options:", finalOptions);
    
    const response = await fetch(`${API_BASE_URL}${path}`, finalOptions);

    // If request failed, throw error with backend message
    if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        console.error("[ERROR API] Response not OK:", errorPayload);
        throw new Error(errorPayload.message || `Request failed (${response.status})`);
    }

    // Handle 204 No Content responses
    if (response.status === 204) return null;
    return response.json(); // Parse and return JSON response
}
