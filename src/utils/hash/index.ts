import type { HashAlgorithm } from "./types";

export async function hash(
  text: string,
  algorithm: HashAlgorithm = "SHA-256",
  salt = "",
): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text + salt);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);

  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
