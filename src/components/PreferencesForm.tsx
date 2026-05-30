"use client";

import { useState } from "react";
import type { UserPreferences } from "@/lib/types";

interface Props {
  initial?: UserPreferences | null;
  onSubmit: (prefs: UserPreferences) => void;
  submitLabel?: string;
}

const GOALS = [
  { value: "weight_loss", label: "Weight Loss", emoji: "📉" },
  { value: "muscle_gain", label: "Muscle Gain", emoji: "💪" },
  { value: "maintenance", label: "Maintenance", emoji: "⚖️" },
  { value: "custom", label: "Custom", emoji: "🎯" },
] as const;

const RESTRICTIONS = [
  "Vegan",
  "Vegetarian",
  "Halal",
  "Kosher",
  "Gluten-Free",
  "Dairy-Free",
  "Keto",
  "Paleo",
];

export default function PreferencesForm({
  initial,
  onSubmit,
  submitLabel = "Save",
}: Props) {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<UserPreferences["goal"]>(
    initial?.goal ?? "maintenance"
  );
  const [calories, setCalories] = useState(
    initial?.dailyCalorieTarget ?? 2000
  );
  const [restrictions, setRestrictions] = useState<string[]>(
    initial?.restrictions ?? []
  );
  const [allergies, setAllergies] = useState(initial?.allergies ?? "");

  const toggleRestriction = (r: string) => {
    setRestrictions((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    );
  };

  const handleSubmit = () => {
    onSubmit({
      goal,
      dailyCalorieTarget: calories,
      restrictions,
      allergies: allergies.trim(),
    });
  };

  const totalSteps = 4;

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress bar */}
      <div className="mb-10">
        <div className="flex justify-between text-xs text-txt-muted mb-2">
          <span>
            Step {step + 1} of {totalSteps}
          </span>
          <span>{Math.round(((step + 1) / totalSteps) * 100)}%</span>
        </div>
        <div className="h-1 bg-bg-subtle rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 0: Goal */}
      {step === 0 && (
        <div className="animate-slide-up">
          <h2 className="font-display text-2xl font-semibold mb-2">
            What&apos;s your goal?
          </h2>
          <p className="text-txt-secondary text-sm mb-6">
            We&apos;ll tailor nutrition insights to help you get there.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {GOALS.map((g) => (
              <button
                key={g.value}
                onClick={() => setGoal(g.value)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  goal === g.value
                    ? "border-accent bg-accent-soft"
                    : "border-transparent bg-surface hover:bg-bg-subtle"
                }`}
              >
                <span className="text-2xl mb-2 block">{g.emoji}</span>
                <span className="text-sm font-medium">{g.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => setStep(1)}
            className="w-full py-3 bg-accent text-white font-medium rounded-xl hover:bg-accent-glow transition-colors"
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 1: Calories */}
      {step === 1 && (
        <div className="animate-slide-up">
          <h2 className="font-display text-2xl font-semibold mb-2">
            Daily calorie target
          </h2>
          <p className="text-txt-secondary text-sm mb-6">
            How many calories do you aim for each day?
          </p>

          <div className="bg-surface rounded-2xl shadow-card p-6 md:p-8 text-center mb-8">
            <div className="flex items-center justify-center gap-4 md:gap-6">
              <button
                onClick={() => setCalories((c) => Math.max(500, c - 100))}
                className="w-14 h-14 rounded-full bg-bg-subtle hover:bg-black/[0.06] active:scale-95 flex items-center justify-center text-2xl font-medium text-txt-secondary transition-all"
              >
                −
              </button>
              <div className="min-w-0 flex-1">
                <input
                  type="number"
                  value={calories}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  onChange={(e) =>
                    setCalories(Math.max(500, parseInt(e.target.value) || 0))
                  }
                  className="text-4xl md:text-5xl font-display font-semibold text-center w-full bg-transparent outline-none text-txt"
                />
                <p className="text-sm text-txt-muted mt-1">kcal / day</p>
              </div>
              <button
                onClick={() => setCalories((c) => Math.min(10000, c + 100))}
                className="w-14 h-14 rounded-full bg-bg-subtle hover:bg-black/[0.06] active:scale-95 flex items-center justify-center text-2xl font-medium text-txt-secondary transition-all"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(0)}
              className="px-6 py-3 bg-bg-subtle text-txt-secondary font-medium rounded-xl hover:bg-black/[0.06] transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-3 bg-accent text-white font-medium rounded-xl hover:bg-accent-glow transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Restrictions */}
      {step === 2 && (
        <div className="animate-slide-up">
          <h2 className="font-display text-2xl font-semibold mb-2">
            Any dietary restrictions?
          </h2>
          <p className="text-txt-secondary text-sm mb-6">
            Select all that apply, or skip if none.
          </p>

          <div className="flex flex-wrap gap-2 mb-8">
            {RESTRICTIONS.map((r) => (
              <button
                key={r}
                onClick={() => toggleRestriction(r)}
                className={`px-4 py-2.5 md:py-2 rounded-full text-sm font-medium transition-all active:scale-95 ${
                  restrictions.includes(r)
                    ? "bg-accent text-white"
                    : "bg-surface border border-black/[0.06] text-txt-secondary hover:border-accent/30"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-3 bg-bg-subtle text-txt-secondary font-medium rounded-xl hover:bg-black/[0.06] transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex-1 py-3 bg-accent text-white font-medium rounded-xl hover:bg-accent-glow transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Allergies */}
      {step === 3 && (
        <div className="animate-slide-up">
          <h2 className="font-display text-2xl font-semibold mb-2">
            Any allergies?
          </h2>
          <p className="text-txt-secondary text-sm mb-6">
            We&apos;ll flag potential allergens in your scans. Leave blank if
            none.
          </p>

          <textarea
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
            placeholder="e.g., peanuts, shellfish, soy, tree nuts…"
            rows={3}
            className="w-full px-4 py-3 bg-surface border border-black/[0.06] rounded-xl text-txt placeholder:text-txt-muted outline-none focus:border-accent/40 transition-colors resize-none mb-8"
          />

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 bg-bg-subtle text-txt-secondary font-medium rounded-xl hover:bg-black/[0.06] transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 bg-accent text-white font-medium rounded-xl hover:bg-accent-glow transition-colors"
            >
              {submitLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
