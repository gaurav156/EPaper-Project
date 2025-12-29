import { useEffect } from "react";
import { logout } from "../services/api";

export default function useIdleLogout(ms = 15 * 60 * 1000) {
  useEffect(() => {
    let timer;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(logout, ms);
    };
    ["mousemove", "keydown", "click"].forEach(e =>
      window.addEventListener(e, reset)
    );
    reset();
    return () => {
      ["mousemove", "keydown", "click"].forEach(e =>
        window.removeEventListener(e, reset)
      );
      clearTimeout(timer);
    };
  }, [ms]);
}