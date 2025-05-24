"use client";

const ACCESS_TOKEN_KEY = "access_token";

export const getAccessToken = (): string => {
  if (typeof window === "undefined") {
    return "";
  }

  return localStorage.getItem(ACCESS_TOKEN_KEY) ?? "";
};

export const setAccessToken = (token: string): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch (error) {
    console.error("Failed to set access token to localStorage:", error);
  }
};

export const removeAccessToken = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(ACCESS_TOKEN_KEY);
};

export const isExistsAccessToken = (): boolean => {
  const token = getAccessToken();
  return token !== null && token.trim() !== "";
};
