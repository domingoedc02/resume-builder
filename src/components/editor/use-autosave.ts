import { useEffect, useRef, useState } from "react";
import {
  createAutosaver,
  type Autosaver,
  type SaveStatus,
} from "@/lib/resume/autosave";

/** Saves `value` 1s after it stops changing. Flushes on unmount and tab close. */
export function useAutosave<T>(
  value: T,
  save: (value: T) => Promise<void>,
  retryable?: (error: unknown) => boolean,
) {
  const [state, setState] = useState<{ status: SaveStatus; error?: unknown }>({
    status: "idle",
  });
  const saver = useRef<Autosaver<T> | null>(null);
  const initial = useRef(value);

  useEffect(() => {
    const a = createAutosaver<T>({
      save,
      retryable,
      onStatus: (status, error) => setState({ status, error }),
    });
    saver.current = a;
    const onUnload = (e: BeforeUnloadEvent) => {
      if (!a.dirty) return;
      void a.flush();
      e.preventDefault(); // Prompts the user while the write is in flight.
    };
    window.addEventListener("beforeunload", onUnload);
    return () => {
      window.removeEventListener("beforeunload", onUnload);
      saver.current = null;
      void a.flush().finally(a.dispose);
    };
  }, [save, retryable]);

  useEffect(() => {
    if (value !== initial.current) saver.current?.set(value);
  }, [value]);

  return state;
}
