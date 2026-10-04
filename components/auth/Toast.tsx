export default function Toast({ message }: { message: string }) {
  return (
    <div className="pointer-events-none fixed top-5 right-5 z-50 max-w-sm animate-[toast-in_0.25s_ease-out]">
      <div className="pointer-events-auto rounded-lg border border-[#1c2118]/10 bg-white px-4 py-3 text-[0.85rem] text-[#1c2118] shadow-[0_8px_30px_rgba(28,33,24,0.12)]">
        {message}
      </div>
    </div>
  );
}
