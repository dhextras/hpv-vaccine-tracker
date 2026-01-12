interface ProgressBarProps {
  progress: number;
  showPercentage?: boolean;
  className?: string;
}

export function ProgressBar({
  progress,
  showPercentage = true,
  className = "",
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Progress</span>
        {showPercentage && (
          <span className="text-sm font-semibold text-primary-600">
            {clampedProgress}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-primary-600 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}

interface MilestoneProgressProps {
  milestones: { label: string; percentage: number }[];
  currentProgress: number;
}

export function MilestoneProgress({
  milestones,
  currentProgress,
}: MilestoneProgressProps) {
  return (
    <div className="w-full space-y-3">
      <div className="relative">
        <div className="absolute top-1.5 left-0 right-0 h-0.5 bg-gray-200" />
        <div className="relative flex justify-between">
          {milestones.map((milestone, index) => {
            const isComplete = currentProgress >= milestone.percentage;
            const isCurrent =
              currentProgress >= milestone.percentage &&
              (index === milestones.length - 1 ||
                currentProgress < milestones[index + 1].percentage);

            return (
              <div key={milestone.label} className="flex flex-col items-center">
                <div
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    isComplete
                      ? "bg-primary-600"
                      : "bg-gray-300 border-2 border-white"
                  } ${isCurrent ? "ring-4 ring-primary-200" : ""}`}
                />
                <span
                  className={`mt-2 text-xs text-center max-w-20 ${
                    isComplete ? "text-primary-600 font-medium" : "text-gray-500"
                  }`}
                >
                  {milestone.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
