export default function MajlisMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <ellipse
          key={deg}
          cx="12"
          cy="4.15"
          rx="1.05"
          ry="3.55"
          transform={`rotate(${deg} 12 12)`}
        />
      ))}
    </svg>
  );
}
