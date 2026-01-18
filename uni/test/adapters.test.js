import { createMobileStorageAdapter } from "../src/adapters/mobileStorageAdapter";
import { createMobileFetchAdapter } from "../src/adapters/mobileFetchAdapter";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

import AsyncStorage from "@react-native-async-storage/async-storage";

describe("mobileStorageAdapter", () => {
  const adapter = createMobileStorageAdapter();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("set/get/remove/clear workflow", async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify({ a: 1 }));

    await adapter.set("k", { a: 1 });
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("k", JSON.stringify({ a: 1 }));

    const val = await adapter.get("k");
    expect(val).toEqual({ a: 1 });

    await adapter.remove("k");
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith("k");

    await adapter.clear();
    expect(AsyncStorage.clear).toHaveBeenCalled();
  });

  test("get returns null on parse error", async () => {
    AsyncStorage.getItem.mockResolvedValueOnce("notjson");
    const val = await adapter.get("bad");
    expect(val).toBeNull();
  });
});

describe("mobileFetchAdapter", () => {
  const adapter = createMobileFetchAdapter();

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("fetch appends cache-bust param", async () => {
    global.fetch.mockResolvedValueOnce({ json: async () => ({ ok: true }), text: async () => "ok" });
    await adapter.fetch("https://example.com/path");
    expect(global.fetch).toHaveBeenCalled();
    const calledUrl = global.fetch.mock.calls[0][0];
    expect(calledUrl).toMatch(/\?t=\d+$/);
  });

  test("fetch preserves existing query params", async () => {
    global.fetch.mockResolvedValueOnce({ json: async () => ({ ok: true }), text: async () => "ok" });
    await adapter.fetch("https://example.com/path?x=1");
    const calledUrl = global.fetch.mock.calls[0][0];
    expect(calledUrl).toMatch(/&t=\d+$/);
  });

  test("fetchJSON returns parsed json", async () => {
    global.fetch.mockResolvedValueOnce({ json: async () => ({ hello: "world" }) });
    const res = await adapter.fetchJSON("https://example.com");
    expect(res).toEqual({ hello: "world" });
  });

  test("fetch throws on network error", async () => {
    global.fetch.mockRejectedValueOnce(new Error("net"));
    await expect(adapter.fetch("https://nope")).rejects.toThrow("net");
  });
});
