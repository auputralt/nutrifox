"use client";

import { useState, useEffect } from "react";
import NavBar from "@/components/NavBar";
import { getHistory, clearHistory } from "@/lib/storage";
import type { ScanRecord } from "@/lib/types";

export default function HistoryPage() {
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleClear = () => {
    if (window.confirm("Clear all scan history? This cannot be undone.")) {
      clearHistory();
      setHistory([]);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <NavBar />
      <main className="max-w-2xl mx-auto px-5 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-semibold mb-1">
              Scan History
            </h1>
            <p className="text-txt-secondary text-sm">
              {history.length} scan{history.length !== 1 ? "s" : ""} saved
            </p>
          </div>

          {history.length > 0 && (
            <button
              onClick={handleClear}
              className="text-sm text-danger hover:underline shrink-0"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Empty state */}
        {history.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-bg-subtle flex items-center justify-center mx-auto mb-4">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8a8a82"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <p className="font-display text-lg font-medium text-txt mb-1">
              No scans yet
            </p>
            <p className="text-sm text-txt-muted">
              Your food analyses will appear here after you save them.
            </p>
          </div>
        )}

        {/* History list */}
        <div className="space-y-3">
          {history.map((record) => {
            const isExpanded = expanded === record.id;
            const { foods, total, allergenWarnings } = record.analysis;

            return (
              <div
                key={record.id}
                className="bg-surface rounded-2xl shadow-card overflow-hidden animate-fade-in"
              >
                {/* Header row */}
                <button
                  onClick={() =>
                    setExpanded(isExpanded ? null : record.id)
                  }
                  className="w-full flex items-center gap-4 p-4 min-h-[56px] text-left hover:bg-bg-subtle/50 transition-colors active:bg-bg-subtle"
                >
                  {/* Thumbnail */}
                  <div className="w-12 h-12 rounded-lg bg-bg-subtle overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={record.imageDataUrl}
                      alt="Scan"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-txt truncate">
                      {foods.length > 0
                        ? foods.map((f) => f.name).join(", ")
                        : "Unknown food"}
                    </p>
                    <p className="text-xs text-txt-muted">
                      {formatDate(record.timestamp)}
                    </p>
                  </div>

                  {/* Calories */}
                  <div className="text-right shrink-0">
                    <p className="font-display font-semibold text-txt">
                      {Math.round(total.calories)}
                    </p>
                    <p className="text-xs text-txt-muted">kcal</p>
                  </div>

                  {/* Expand chevron */}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`shrink-0 text-txt-muted transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-black/[0.04] pt-3 animate-slide-up">
                    {/* Food breakdown */}
                    <div className="space-y-1 mb-3">
                      {foods.map((food, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-txt-secondary">
                            {food.name}{" "}
                            <span className="text-txt-muted">
                              ({food.portion})
                            </span>
                          </span>
                          <span className="font-medium tabular-nums">
                            {Math.round(food.calories)} kcal
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Macros */}
                    <div className="flex gap-4 text-xs text-txt-muted">
                      <span>
                        Protein:{" "}
                        <span className="text-txt-secondary font-medium">
                          {Math.round(total.protein)}g
                        </span>
                      </span>
                      <span>
                        Carbs:{" "}
                        <span className="text-txt-secondary font-medium">
                          {Math.round(total.carbs)}g
                        </span>
                      </span>
                      <span>
                        Fat:{" "}
                        <span className="text-txt-secondary font-medium">
                          {Math.round(total.fat)}g
                        </span>
                      </span>
                      <span>
                        Fiber:{" "}
                        <span className="text-txt-secondary font-medium">
                          {Math.round(total.fiber)}g
                        </span>
                      </span>
                    </div>

                    {/* Allergen warnings */}
                    {allergenWarnings.length > 0 && (
                      <div className="mt-2 text-xs text-danger">
                        ⚠ {allergenWarnings.join(", ")}
                      </div>
                    )}

                    {/* Notes */}
                    {record.analysis.notes && (
                      <p className="mt-2 text-xs text-txt-muted italic">
                        {record.analysis.notes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
