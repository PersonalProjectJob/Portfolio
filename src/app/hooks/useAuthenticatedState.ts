import { useEffect, useState } from "react";
import { resolveAuthenticatedState } from "../lib/sessionScope";

export function useAuthenticatedState(): boolean {
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    resolveAuthenticatedState(),
  );

  useEffect(() => {
    const sync = () => {
      setIsAuthenticated(resolveAuthenticatedState());
    };

    sync();

    window.addEventListener("focus", sync);
    window.addEventListener("storage", sync);
    document.addEventListener("visibilitychange", sync);

    return () => {
      window.removeEventListener("focus", sync);
      window.removeEventListener("storage", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return isAuthenticated;
}
