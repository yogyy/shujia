export function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-border border px-5 py-3">
      <p className="text-muted-foreground text-xs tracking-widest uppercase">{label}</p>
      <p className="text-primary mt-1 font-serif text-3xl">{value}</p>
    </div>
  );
}

export function TableHeader({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-widest uppercase ${className}`}
    >
      {children}
    </th>
  );
}

export function TableData({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}

const formatLabels: Record<string, string> = {
  physical: "Physical",
  ebook: "eBook",
  audiobook: "Audio",
};

const formatColors: Record<string, string> = {
  physical: "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5",
  ebook: "border-accent/40 text-accent bg-accent/5",
  audiobook: "border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/5",
};

export function FormatBadge({ format }: { format: string | null }) {
  const key = format ?? "ebook";
  return (
    <span
      className={`border px-1.5 py-0.5 text-xs ${formatColors[key] ?? "border-border text-muted-foreground"}`}
    >
      {formatLabels[key] ?? key}
    </span>
  );
}
