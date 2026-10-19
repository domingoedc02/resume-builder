export type SaveStatus = "idle" | "saving" | "saved" | "error";

type Options<T> = {
  save: (value: T) => Promise<void>;
  onStatus: (status: SaveStatus, error?: unknown) => void;
  /** Quiet period after the last `set` before saving. */
  delay?: number;
  retryDelay?: number;
  /** Return false for errors a retry cannot fix (validation, 4xx). */
  retryable?: (error: unknown) => boolean;
};

export type Autosaver<T> = {
  set: (value: T) => void;
  flush: () => Promise<void>;
  dispose: () => void;
  readonly dirty: boolean;
};

/**
 * Debounced last-write-wins saver. One save in flight at a time; edits made
 * during a save are sent right after it. Framework-free so it can be tested.
 */
export function createAutosaver<T>({
  save,
  onStatus,
  delay = 1000,
  retryDelay = 4000,
  retryable = () => true,
}: Options<T>): Autosaver<T> {
  let pending: { value: T } | undefined;
  let version = 0;
  let saved = 0;
  let busy = false;
  let disposed = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const schedule = (ms: number) => {
    clearTimeout(timer);
    timer = setTimeout(() => void flush(), ms);
  };

  async function flush(): Promise<void> {
    clearTimeout(timer);
    if (busy || !pending || saved === version) return;
    busy = true;
    const sending = version;
    onStatus("saving");
    try {
      await save(pending.value);
      saved = sending;
    } catch (error) {
      busy = false;
      onStatus("error", error);
      if (!disposed && retryable(error)) schedule(retryDelay);
      return;
    }
    busy = false;
    if (saved === version) onStatus("saved");
    else await flush();
  }

  return {
    set(value) {
      pending = { value };
      version += 1;
      schedule(delay);
    },
    flush,
    dispose() {
      disposed = true;
      clearTimeout(timer);
    },
    get dirty() {
      return saved !== version;
    },
  };
}
