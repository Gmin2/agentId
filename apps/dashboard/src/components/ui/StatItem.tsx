export function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="text-fg-dim text-[10px] tracking-[0.3em] uppercase">{label}</div>
      <div className="text-5xl font-light tracking-tight text-fg">{value}</div>
    </div>
  );
}

export function Divider() {
  return <div className="hidden md:block w-px h-16 bg-stroke" />;
}
