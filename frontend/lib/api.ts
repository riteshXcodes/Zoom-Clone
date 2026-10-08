"use client";

import { useAuth } from "@clerk/nextjs";

export function useApi() {
  const { getToken } = useAuth();

  async function apiFetch(
    url: string,
    options: RequestInit = {}
  ) {
    const token = await getToken();

    const headers = new Headers(
      options.headers
    );

    if (token) {
      headers.set(
        "Authorization",
        `Bearer ${token}`
      );
    }

    return fetch(url, {
      ...options,
      headers,
    });
  }

  return { apiFetch };
}