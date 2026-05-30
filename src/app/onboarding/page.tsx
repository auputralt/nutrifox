"use client";

import { useRouter } from "next/navigation";
import PreferencesForm from "@/components/PreferencesForm";
import type { UserPreferences } from "@/lib/types";
import { savePreferences } from "@/lib/storage";

export default function OnboardingPage() {
  const router = useRouter();

  const handleComplete = (prefs: UserPreferences) => {
    savePreferences(prefs);
    router.replace("/");
  };

  return (
    <main className="min-h-dvh flex flex-col pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-lg mx-auto w-full px-5 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-accent mb-2">
            NutriFox
          </h1>
          <p className="text-txt-secondary text-sm">
            Let&apos;s set up your profile so we can personalize your
            nutrition analysis.
          </p>
        </div>

        <PreferencesForm
          onSubmit={handleComplete}
          submitLabel="Get Started"
        />
      </div>
    </main>
  );
}
