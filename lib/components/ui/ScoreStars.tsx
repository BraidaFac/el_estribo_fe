"use client";

import { StarIcon } from "@heroicons/react/24/solid";

export type ScoreStarsProps = {
  label: string;
  /** 1–5 (inclusive). */
  value: number;
  onChange: (v: number) => void;
  description?: string;
};

/**
 * Puntuación 1–5: cinco estrellas; clic en la estrella n fija el valor en n.
 */
export function ScoreStars({ label, value, onChange, description }: ScoreStarsProps) {
  const v = Math.min(5, Math.max(1, value));

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-2">
        <span className="min-w-[7rem] text-sm font-medium text-pastel-text">{label}</span>
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              className="rounded p-0.5 transition hover:bg-pastel-primary/10"
              onClick={() => onChange(n)}
              aria-label={`${n} de 5 estrellas`}
            >
              <StarIcon
                className={`h-7 w-7 ${
                  v >= n ? "text-amber-400" : "text-default-200"
                }`}
              />
            </button>
          ))}
        </div>
        <span className="text-sm text-pastel-text/70 tabular-nums">{v}/5</span>
      </div>
      {description ? (
        <p className="text-xs text-pastel-text/60 pl-0 md:pl-[7.25rem]">{description}</p>
      ) : null}
    </div>
  );
}
