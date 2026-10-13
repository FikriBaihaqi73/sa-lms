import { useEffect, useState } from "react";

export const DEFAULT_DEBOUNCE_DELAY = 400;

export function useDebounce<T>(value: T, delay = DEFAULT_DEBOUNCE_DELAY): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => window.clearTimeout(timeoutId);
  }, [value, delay]);

  return debouncedValue;
}
