import { useEffect } from "react";

export default function useHome() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = "/register";
    }, 3000);
    return () => clearTimeout(timer);
  }, []);
}
