"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();

  // Hide on onboarding
  if (pathname === "/onboarding") return null;

  return (
    <nav className="sticky top-0 z-40 bg-bg/80 backdrop-blur-md border-b border-black/[0.04] pt-[env(safe-area-inset-top)]">
      <div className="max-w-2xl mx-auto px-5 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group min-h-[44px] min-w-[44px] justify-center">
          <span className="text-xl font-display font-semibold text-accent tracking-tight">
            NutriFox
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/history"
            className={`p-2.5 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${
              pathname === "/history"
                ? "bg-accent-soft text-accent"
                : "text-txt-muted hover:text-txt-secondary hover:bg-bg-subtle"
            }`}
            title="Scan history"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </Link>

          <Link
            href="/settings"
            className={`p-2.5 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${
              pathname === "/settings"
                ? "bg-accent-soft text-accent"
                : "text-txt-muted hover:text-txt-secondary hover:bg-bg-subtle"
            }`}
            title="Settings"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </Link>
        </div>
      </div>
    </nav>
  );
}
