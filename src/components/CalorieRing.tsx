"use client";

interface Props {
  calories: number;
  dailyTarget: number;
}

export default function CalorieRing({ calories, dailyTarget }: Props) {
  const percentage = Math.min((calories / dailyTarget) * 100, 100);
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const ringColor =
    percentage > 100
      ? "#b83b3b"
      : percentage > 75
      ? "#b87b3b"
      : "#2d5a3d";

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg width="144" height="144" viewBox="0 0 144 144">
          {/* Background ring */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            fill="none"
            stroke="#ebe8e0"
            strokeWidth="8"
          />
          {/* Progress ring */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            className="ring-progress"
            style={
              {
                "--circumference": circumference,
                "--offset": offset,
              } as React.CSSProperties
            }
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-display font-semibold text-txt">
            {Math.round(calories)}
          </span>
          <span className="text-xs text-txt-muted mt-0.5">kcal</span>
        </div>
      </div>

      <p className="text-sm text-txt-secondary mt-3">
        <span className="font-medium">{Math.round(percentage)}%</span> of your{" "}
        {dailyTarget.toLocaleString()} kcal goal
      </p>
    </div>
  );
}
