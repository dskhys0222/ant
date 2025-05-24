import { beforeAll, describe, expect, test, vi } from "vitest";
import { hash } from "./index";

describe("hash", () => {
  beforeAll(() => {
    // crypto.subtle.digest のモック
    if (!globalThis.crypto) {
      Object.defineProperty(globalThis, "crypto", {
        value: {
          subtle: {
            digest: vi.fn(),
          },
        },
      });
    }
  });

  test("文字列をSHA-256でハッシュする", async () => {
    // モックの出力を設定
    const mockDigest = vi
      .spyOn(crypto.subtle, "digest")
      .mockImplementation(() => {
        // "hello" の SHA-256 ハッシュ値に対応するバッファを作成
        return Promise.resolve(
          new Uint8Array([
            0x2c, 0xf2, 0x4d, 0xba, 0x5f, 0xb0, 0xa3, 0x0e, 0x26, 0xe8, 0x3b,
            0x2a, 0xc5, 0xb9, 0xe2, 0x9e, 0x1b, 0x16, 0x1e, 0x5c, 0x1f, 0xa7,
            0x42, 0x5e, 0x73, 0x04, 0x33, 0x62, 0x93, 0x8b, 0x98, 0x24,
          ]).buffer,
        );
      });

    const result = await hash("hello");

    // SHA-256 ハッシュの期待値
    const expectedHash =
      "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824";

    expect(mockDigest).toHaveBeenCalledWith("SHA-256", expect.any(Uint8Array));
    expect(result).toBe(expectedHash);

    mockDigest.mockRestore();
  });

  test("異なる入力に対して異なるハッシュを生成する", async () => {
    const hash1 = await hash("hello");
    const hash2 = await hash("world");

    expect(hash1).not.toBe(hash2);
  });

  test("同じ入力に対して一貫したハッシュを生成する", async () => {
    const hash1 = await hash("consistent");
    const hash2 = await hash("consistent");

    expect(hash1).toBe(hash2);
  });
});
