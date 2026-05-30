"use client";

import { useState, useEffect } from "react";
import type { UserPreferences } from "@/lib/types";
import { getPreferences, savePreferences } from "@/lib/storage";

export function usePreferences() {
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setPrefs(getPreferences());
    setLoaded(true);
  }, []);

  const update = (newPrefs: UserPreferences) => {
    savePreferences(newPrefs);
    setPrefs(newPrefs);
  };

  return { prefs, loaded, update };
}
