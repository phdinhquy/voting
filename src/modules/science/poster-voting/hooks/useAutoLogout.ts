"use client";

import {
  useEffect,
  useRef,
} from "react";

import { logout } from "../services/auth.service";

const TIMEOUT = 5 * 60 * 1000;

export function useAutoLogout() {
  const timeoutRef =
    useRef<NodeJS.Timeout | null>(
      null
    );

  useEffect(() => {

    const resetTimer = () => {

      if (timeoutRef.current) {
        clearTimeout(
          timeoutRef.current
        );
      }

      timeoutRef.current =
        setTimeout(() => {
          logout();
        }, TIMEOUT);
    };

    window.addEventListener(
      "mousemove",
      resetTimer
    );

    window.addEventListener(
      "keydown",
      resetTimer
    );

    resetTimer();

    return () => {

      window.removeEventListener(
        "mousemove",
        resetTimer
      );

      window.removeEventListener(
        "keydown",
        resetTimer
      );

      if (timeoutRef.current) {
        clearTimeout(
          timeoutRef.current
        );
      }
    };
  }, []);
}