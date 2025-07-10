import config from "./env";

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Error class
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// API Client class
class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.apiBaseUrl;
  }

  // Helper method to build URL
  private buildUrl(endpoint: string): string {
    return `${this.baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  }

  // Helper method to handle response
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If we can't parse the error response, use the default message
      }

      throw new ApiError(errorMessage, response.status);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    }

    return response.text() as T;
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = this.buildUrl(endpoint);

    const defaultOptions: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include", // Include cookies for authentication
    };

    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
    });

    return this.handleResponse<T>(response);
  }

  // GET request
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(this.buildUrl(endpoint));

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return this.request<T>(url.pathname + url.search);
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    });
  }

  // Upload file
  async upload<T>(
    endpoint: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const formData = new FormData();
    formData.append("file", file);

    return this.request<T>(endpoint, {
      method: "POST",
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let the browser set it with boundary
      },
    });
  }
}

// Create and export API client instance
export const apiClient = new ApiClient();

// Export convenience methods
export const api = {
  get: <T>(endpoint: string, params?: Record<string, any>) =>
    apiClient.get<T>(endpoint, params),
  post: <T>(endpoint: string, data?: any) => apiClient.post<T>(endpoint, data),
  put: <T>(endpoint: string, data?: any) => apiClient.put<T>(endpoint, data),
  patch: <T>(endpoint: string, data?: any) =>
    apiClient.patch<T>(endpoint, data),
  delete: <T>(endpoint: string) => apiClient.delete<T>(endpoint),
  upload: <T>(
    endpoint: string,
    file: File,
    onProgress?: (progress: number) => void
  ) => apiClient.upload<T>(endpoint, file, onProgress),
};

export default api;
