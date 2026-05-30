"use client";

import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import PreferencesForm from "@/components/PreferencesForm";
import { usePreferences } from "@/hooks/usePreferences";
import type { UserPreferences } from "@/lib/types";

export default function SettingsPage() {
  const router = useRouter();
  const { prefs, loaded, update } = usePreferences();

  const handleSave = (newPrefs: UserPreferences) => {
    update(newPrefs);
  };

  if (!loaded) {
    return (
      <>
        <NavBar />
        <main className="max-w-2xl mx-auto px-5 py-8">
          <div className="skeleton h-8 w-48 mb-6" />
          <div className="skeleton h-96 rounded-2xl" />
        </main>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <main className="max-w-2xl mx-auto px-5 py-8">
        <div className="mb-8">
          <h1 className="font-display text-2xl md:text-3xl font-semibold mb-1">
            Settings
          </h1>
          <p className="text-txt-secondary text-sm">
            Update your dietary preferences and goals.
          </p>
        </div>

        <PreferencesForm
          initial={prefs}
          onSubmit={handleSave}
          submitLabel="Save Changes"
        />
      </main>
    </>
  );
}
