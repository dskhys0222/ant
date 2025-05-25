import { hostRegex } from "@/constants";

const HOSTNAME_STORAGE_KEY = "app_hostname";

export function getHost(): string {
  if (typeof window === "undefined") {
    return "";
  }
  return localStorage.getItem(HOSTNAME_STORAGE_KEY) || "";
}

export function setHost(hostname: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  if (!isValidHostname(hostname)) {
    console.error("無効なホスト名です");
    throw new Error("無効なホスト名です");
  }

  try {
    localStorage.setItem(HOSTNAME_STORAGE_KEY, hostname);
    return true;
  } catch {
    console.error("ストレージが満杯です");
    return false;
  }
}

export function clearHost(): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(HOSTNAME_STORAGE_KEY);
}

export function isExistsHost(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  const hostname = localStorage.getItem(HOSTNAME_STORAGE_KEY);
  return hostname !== null && hostname !== "";
}

function isValidHostname(hostname: string): boolean {
  return hostRegex.test(hostname);
}
