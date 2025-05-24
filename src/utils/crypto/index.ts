const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const ITERATIONS = 100000;

export async function encryptObject<T>(
  data: T,
  password: string,
): Promise<string> {
  try {
    const jsonString = JSON.stringify(data);
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(jsonString);

    const salt = generateRandomBytes(SALT_LENGTH);
    const iv = generateRandomBytes(IV_LENGTH);

    const key = await deriveKey(password, salt);

    const encryptedData = await crypto.subtle.encrypt(
      {
        name: ALGORITHM,
        iv: iv,
      },
      key,
      dataBuffer,
    );

    const saltBase64 = arrayBufferToBase64(salt);
    const ivBase64 = arrayBufferToBase64(iv);
    const dataBase64 = arrayBufferToBase64(encryptedData);

    return `${saltBase64}:${ivBase64}:${dataBase64}`;
  } catch (error) {
    throw new Error(
      `暗号化に失敗しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
    );
  }
}

export async function decryptObject<T>(
  encryptedData: string,
  password: string,
): Promise<T> {
  try {
    const parts = encryptedData.split(":");
    if (parts.length !== 3) {
      throw new Error("無効な暗号化データ形式です");
    }

    const [saltBase64, ivBase64, dataBase64] = parts;

    const iv = new Uint8Array(base64ToArrayBuffer(ivBase64));
    const data = new Uint8Array(base64ToArrayBuffer(dataBase64));
    const salt = new Uint8Array(base64ToArrayBuffer(saltBase64));

    const key = await deriveKey(password, salt);

    const decryptedData = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv: iv,
      },
      key,
      data,
    );

    const decoder = new TextDecoder();
    const jsonString = decoder.decode(decryptedData);

    return JSON.parse(jsonString) as T;
  } catch (error) {
    throw new Error(
      `復号化に失敗しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
    );
  }
}

async function deriveKey(
  password: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    {
      name: ALGORITHM,
      length: KEY_LENGTH,
    },
    false,
    ["encrypt", "decrypt"],
  );
}

function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function generateRandomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}
