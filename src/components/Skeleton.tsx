export default function Skeleton() {
  return (
    <div className="bg-surface rounded-2xl shadow-card p-6 md:p-8 animate-fade-in">
      {/* Title skeleton */}
      <div className="skeleton h-7 w-48 mb-6" />

      {/* Ring skeleton */}
      <div className="flex justify-center mb-8">
        <div className="skeleton w-36 h-36 rounded-full" />
      </div>

      {/* Macro bars skeleton */}
      <div className="space-y-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="skeleton h-4 w-12" />
            <div className="flex-1 skeleton h-2.5" />
            <div className="skeleton h-4 w-14" />
          </div>
        ))}
      </div>

      {/* Alert skeleton */}
      <div className="skeleton h-16 w-full rounded-xl mb-6" />

      {/* Button skeleton */}
      <div className="flex gap-3">
        <div className="skeleton h-11 flex-1 rounded-xl" />
        <div className="skeleton h-11 w-32 rounded-xl" />
      </div>
    </div>
  );
}
