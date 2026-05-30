"use client";

import type { NutritionAnalysis, ScanRecord } from "@/lib/types";
import CalorieRing from "./CalorieRing";
import MacroBar from "./MacroBar";
import AlertBadge from "./AlertBadge";
import { addScanRecord } from "@/lib/storage";

interface Props {
  analysis: NutritionAnalysis;
  imageDataUrl: string;
  dailyTarget: number;
  onScanAnother: () => void;
}

export default function ResultsView({
  analysis,
  imageDataUrl,
  dailyTarget,
  onScanAnother,
}: Props) {
  const { foods, total, dailyGoalPercentage, allergenWarnings, restrictionConflicts, notes } =
    analysis;

  // Macro targets roughly proportional to a 2000 kcal diet (adjustable)
  const macroMax = {
    protein: dailyTarget * 0.15, // ~30%
    carbs: dailyTarget * 0.125,   // ~50%
    fat: dailyTarget * 0.044,     // ~28%
    fiber: 30,                     // general guideline
  };

  const handleSave = () => {
    const record: ScanRecord = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      imageDataUrl,
      analysis,
    };
    addScanRecord(record);
  };

  return (
    <div className="animate-slide-up space-y-5">
      {/* Back link */}
      <button
        onClick={onScanAnother}
        className="inline-flex items-center gap-1.5 text-sm text-txt-muted hover:text-txt-secondary transition-colors"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Scan another
      </button>

      {/* Image preview */}
      <div className="rounded-2xl overflow-hidden shadow-card aspect-video bg-bg-subtle">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageDataUrl}
          alt="Scanned food"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Main results card */}
      <div className="bg-surface rounded-2xl shadow-card p-6 md:p-8">
        {/* Food items header */}
        {foods.length > 0 && (
          <div className="mb-6">
            <h2 className="font-display text-xl font-semibold mb-1">
              Detected Food
            </h2>
            <div className="space-y-2">
              {foods.map((food, i) => (
                <div
                  key={i}
                  className="flex items-baseline justify-between py-2 border-b border-black/[0.04] last:border-0"
                >
                  <div>
                    <span className="font-medium text-txt">{food.name}</span>
                    <span className="text-sm text-txt-muted ml-2">
                      {food.portion}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-txt tabular-nums">
                    {Math.round(food.calories)} kcal
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calorie ring */}
        <div className="mb-8">
          <CalorieRing calories={total.calories} dailyTarget={dailyTarget} />
        </div>

        {/* Macro bars */}
        <div className="space-y-3 mb-6">
          <h3 className="text-sm font-medium text-txt-muted uppercase tracking-wider mb-3">
            Macros
          </h3>
          <MacroBar
            label="Protein"
            value={total.protein}
            unit="g"
            color="#e07a5f"
            maxValue={macroMax.protein}
            delay={100}
          />
          <MacroBar
            label="Carbs"
            value={total.carbs}
            unit="g"
            color="#e6a23c"
            maxValue={macroMax.carbs}
            delay={200}
          />
          <MacroBar
            label="Fat"
            value={total.fat}
            unit="g"
            color="#5b8fb9"
            maxValue={macroMax.fat}
            delay={300}
          />
          <MacroBar
            label="Fiber"
            value={total.fiber}
            unit="g"
            color="#6b9e78"
            maxValue={macroMax.fiber}
            delay={400}
          />
        </div>

        {/* Alerts */}
        <div className="space-y-3 mb-6 stagger">
          <AlertBadge
            items={allergenWarnings}
            variant="danger"
            icon="alert"
          />
          <AlertBadge
            items={restrictionConflicts}
            variant="warning"
            icon="info"
          />
        </div>

        {/* Notes */}
        {notes && (
          <p className="text-sm text-txt-secondary italic mb-6 border-l-2 border-accent-soft pl-4">
            {notes}
          </p>
        )}

        {/* CTAs */}
        <div className="flex gap-3">
          <button
            onClick={onScanAnother}
            className="flex-1 py-3 bg-accent text-white font-medium rounded-xl hover:bg-accent-glow transition-colors"
          >
            Scan Another
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-bg-subtle text-txt-secondary font-medium rounded-xl hover:bg-black/[0.06] transition-colors"
          >
            Save to Log
          </button>
        </div>
      </div>
    </div>
  );
}
