import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createAutosaver, type SaveStatus } from "./autosave";

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

describe("createAutosaver", () => {
  it("debounces rapid edits into one save of the latest value", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const a = createAutosaver<number>({ save, onStatus: () => {} });
    a.set(1);
    a.set(2);
    a.set(3);
    await vi.advanceTimersByTimeAsync(999);
    expect(save).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith(3);
    expect(a.dirty).toBe(false);
  });

  it("sends edits made during a save right after it finishes", async () => {
    const releases: Array<() => void> = [];
    const save = vi.fn(
      (_v: number) =>
        new Promise<void>((resolve) => {
          releases.push(resolve);
        }),
    );
    const a = createAutosaver<number>({ save, onStatus: () => {} });
    a.set(1);
    await vi.advanceTimersByTimeAsync(1000);
    a.set(2);
    releases[0]?.();
    await vi.advanceTimersByTimeAsync(0);
    expect(save).toHaveBeenCalledTimes(2);
    expect(save).toHaveBeenLastCalledWith(2);
    releases[1]?.();
    await vi.advanceTimersByTimeAsync(0);
    expect(a.dirty).toBe(false);
  });

  it("retries after a retryable error", async () => {
    const save = vi
      .fn()
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValue(undefined);
    const seen: SaveStatus[] = [];
    const a = createAutosaver<number>({
      save,
      onStatus: (s) => seen.push(s),
      retryDelay: 500,
    });
    a.set(1);
    await vi.advanceTimersByTimeAsync(1000);
    expect(seen).toEqual(["saving", "error"]);
    await vi.advanceTimersByTimeAsync(500);
    expect(seen).toEqual(["saving", "error", "saving", "saved"]);
  });

  it("does not retry when the error is not retryable", async () => {
    const save = vi.fn().mockRejectedValue(new Error("invalid"));
    const a = createAutosaver<number>({
      save,
      onStatus: () => {},
      retryable: () => false,
    });
    a.set(1);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(save).toHaveBeenCalledTimes(1);
    expect(a.dirty).toBe(true);
  });

  it("flush saves immediately", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const a = createAutosaver<string>({ save, onStatus: () => {} });
    a.set("x");
    await a.flush();
    expect(save).toHaveBeenCalledWith("x");
    await vi.advanceTimersByTimeAsync(5000);
    expect(save).toHaveBeenCalledTimes(1);
  });
});
