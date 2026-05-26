import { cardMemo, cardMemoNarrow } from "@/lib/cardClasses";

export function MemoBox({
  children,
  narrow = true,
  className = "",
}: {
  children: React.ReactNode;
  narrow?: boolean;
  className?: string;
}) {
  return (
    <div className={`${narrow ? cardMemoNarrow : cardMemo} ${className}`.trim()}>
      {children}
    </div>
  );
}
