class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

class ApiClient {
  private baseURL = "/api"

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`

    const response = await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(response.status, errorData.message || "An error occurred")
    }

    return response
  }

  async get(endpoint: string) {
    const response = await this.request(endpoint)
    return response.json()
  }

  async post(endpoint: string, data?: any) {
    const response = await this.request(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
    return response.json()
  }

  async patch(endpoint: string, data?: any) {
    const response = await this.request(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    })
    return response.json()
  }

  async delete(endpoint: string) {
    const response = await this.request(endpoint, {
      method: "DELETE",
    })
    return response.json()
  }
}

export const api = new ApiClient()
