export class ApiClient {
  constructor(private readonly baseUrl: string) {}

  async get<T>(path: string, init?: RequestInit): Promise<T> {
    return this.request<T>(path, { method: "GET", ...init });
  }

  async post<T>({ path, body, init }: { path: string; body: unknown; init?: RequestInit }) {
    return this.request<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
      ...init,
    });
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      credentials: "include",
      ...init,
    });

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001");
