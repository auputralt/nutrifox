"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePreferences } from "@/hooks/usePreferences";
import NavBar from "@/components/NavBar";
import UploadZone from "@/components/UploadZone";
import ResultsView from "@/components/ResultsView";
import Skeleton from "@/components/Skeleton";
import type { NutritionAnalysis } from "@/lib/types";

type State = "idle" | "preview" | "analyzing" | "results" | "error";

export default function HomePage() {
  const router = useRouter();
  const { prefs, loaded } = usePreferences();
  const [state, setState] = useState<State>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<NutritionAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loaded && !prefs) {
      router.replace("/onboarding");
    }
  }, [loaded, prefs, router]);

  const handleFile = (f: File, previewUrl: string) => {
    setFile(f);
    setPreview(previewUrl);
    setState("preview");
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!file || !prefs) return;
    setState("analyzing");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("preferences", JSON.stringify(prefs));

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Analysis failed (${res.status})`);
      }

      const data: NutritionAnalysis = await res.json();
      setAnalysis(data);
      setState("results");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setState("error");
    }
  };

  const reset = () => {
    setState("idle");
    setFile(null);
    setPreview(null);
    setAnalysis(null);
    setError(null);
  };

  if (!loaded) {
    return (
      <>
        <NavBar />
        <main className="max-w-2xl mx-auto px-5 py-8">
          <Skeleton />
        </main>
      </>
    );
  }

  if (!prefs) return null;

  return (
    <>
      <NavBar />
      <main className="max-w-2xl mx-auto px-5 py-8">
        {/* Idle / Upload */}
        {state === "idle" && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <h1 className="font-display text-3xl md:text-4xl font-semibold mb-2">
                What are you eating?
              </h1>
              <p className="text-txt-secondary">
                Upload a food photo for instant nutrition analysis.
              </p>
            </div>
            <UploadZone onFile={handleFile} />
          </div>
        )}

        {/* Preview */}
        {state === "preview" && preview && (
          <div className="animate-scale-in">
            <div className="bg-surface rounded-2xl shadow-card overflow-hidden">
              <div className="aspect-video bg-bg-subtle">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Food preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5 flex gap-3">
                <button
                  onClick={reset}
                  className="px-5 py-2.5 bg-bg-subtle text-txt-secondary text-sm font-medium rounded-xl hover:bg-black/[0.06] transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={handleAnalyze}
                  className="flex-1 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent-glow transition-colors"
                >
                  Analyze Nutrition
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Analyzing */}
        {state === "analyzing" && <Skeleton />}

        {/* Results */}
        {state === "results" && analysis && preview && (
          <ResultsView
            analysis={analysis}
            imageDataUrl={preview}
            dailyTarget={prefs.dailyCalorieTarget}
            onScanAnother={reset}
          />
        )}

        {/* Error */}
        {state === "error" && (
          <div className="animate-fade-in text-center py-16">
            <div className="w-16 h-16 rounded-full bg-danger-soft flex items-center justify-center mx-auto mb-4">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#b83b3b"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <h2 className="font-display text-xl font-semibold mb-2">
              Analysis Failed
            </h2>
            <p className="text-txt-secondary text-sm mb-6 max-w-sm mx-auto">
              {error}
            </p>
            <button
              onClick={reset}
              className="px-6 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent-glow transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </main>
    </>
  );
}
