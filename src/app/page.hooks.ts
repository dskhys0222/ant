"use client";

import { getHost } from "@/services/host";
import { getUserKey } from "@/services/key";
import { getAccessToken } from "@/services/token";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function useHome() {
  const router = useRouter();
  const isLoggedIn = getHost() && getUserKey() && getAccessToken();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoggedIn) {
        router.push("/tasks");
      } else {
        router.push("/login");
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [router, isLoggedIn]);
}
