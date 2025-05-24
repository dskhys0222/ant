"use client";

import { hash } from "@/utils/hash";

const USER_KEY_KEY = "user_key";

export const generateUserKey = async (
  username: string,
  password: string,
): Promise<string> => {
  if (!username || !password) {
    throw new Error("Username and password must be provided");
  }
  return await hash(password, "SHA-512", username);
};

export const getUserKey = (): string => {
  if (typeof window === "undefined") {
    return "";
  }
  return localStorage.getItem(USER_KEY_KEY) ?? "";
};

export const setUserKey = (key: string): void => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    localStorage.setItem(USER_KEY_KEY, key);
  } catch (error) {
    console.error("Failed to set user key to localStorage:", error);
  }
};

export const removeUserKey = (): void => {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(USER_KEY_KEY);
};

export const isExistsUserKey = (): boolean => {
  const key = getUserKey();
  return key !== null && key.trim() !== "";
};
