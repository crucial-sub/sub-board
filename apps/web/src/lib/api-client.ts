import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

export class ApiClient {
  constructor(private readonly baseUrl: string) {}

  async get<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        "Content-Type": "application/json",
      },
      ...init,
    });

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001");
