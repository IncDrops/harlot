
"use client";

import { useState, useEffect, useCallback } from 'react';

const NSFW_STORAGE_KEY = 'pollitago_show_nsfw';

export function useSettings() {
  const [isMounted, setIsMounted] = useState(false);
  const [showNsfw, setShowNsfw] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedValue = localStorage.getItem(NSFW_STORAGE_KEY);
      if (storedValue) {
        setShowNsfw(JSON.parse(storedValue));
      }
    } catch (error) {
        console.error("Could not read NSFW preference from local storage", error);
    }
  }, []);

  const toggleNsfw = useCallback(() => {
    const newValue = !showNsfw;
    setShowNsfw(newValue);
    try {
        localStorage.setItem(NSFW_STORAGE_KEY, JSON.stringify(newValue));
    } catch (error) {
        console.error("Could not save NSFW preference to local storage", error);
    }
  }, [showNsfw]);

  return {
    isMounted,
    showNsfw,
    toggleNsfw,
  };
}
