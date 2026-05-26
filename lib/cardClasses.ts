/**
 * Product-style cards: 8px corners, 1px border, no heavy shadow + ring stack.
 */

const r = "rounded-md";

export const cardBorder = `${r} border border-[var(--line-dark)] bg-white`;

export const cardBorderHover =
  "transition-colors duration-200 hover:border-[var(--ink)]/35";

export const cardOverflow = `overflow-hidden ${cardBorder}`;

export const cardCream = `${r} border border-[var(--line-dark)] bg-[var(--cream)]`;

export const cardCreamPad = `${cardCream} p-5 sm:p-6`;

export const cardBody = "flex flex-1 flex-col gap-1.5 p-5 sm:p-6";

export const cardBodyCompact = "flex flex-1 flex-col gap-1.5 p-5";

export const cardVehicle = `group flex flex-col ${cardOverflow} ${cardBorderHover}`;

export const cardVehicleRail = `${cardVehicle} rail-card w-[min(82vw,300px)]`;

export const cardImageTop = "relative block overflow-hidden";

export const cardListRow = `group flex flex-col gap-4 ${cardOverflow} ${cardBorderHover} p-4 sm:flex-row sm:items-stretch sm:p-5`;

export const cardListImage =
  "relative block aspect-[16/10] w-full shrink-0 overflow-hidden sm:aspect-auto sm:h-28 sm:w-44";

export const cardGridArticle = `flex flex-col ${cardOverflow}`;

export const cardGridBody = "flex flex-1 flex-col gap-1.5 p-5 sm:p-6";

export const cardFaqItem = `${r} border border-[var(--line-dark)] bg-white px-5 py-4 sm:px-6 sm:py-5`;

export const cardLocation = `${cardCream} px-5 py-6 sm:px-6 sm:py-7 ${cardBorderHover}`;

export const cardCategory = `group relative ${cardOverflow} ${cardBorderHover} p-5 text-left sm:p-6`;

export const cardHeroDark = `relative overflow-hidden ${r} bg-[var(--ink)] px-8 py-14 text-white sm:px-10 sm:py-16`;

export const cardHeroLight = `relative overflow-hidden ${r} border border-[var(--line-dark)] bg-white px-8 py-14 sm:px-10 sm:py-16`;

export const cardImageFrame = `relative overflow-hidden ${r} border border-[var(--line-dark)] bg-[var(--cream-dark)]`;

export const cardPanel = cardOverflow;

export const cardPanelPad = `${cardPanel} p-5 sm:p-6`;

export const cardEmpty = `${r} border border-dashed border-[var(--line-dark)] bg-[var(--cream)] px-6 py-10 text-center text-sm text-[var(--muted)]`;

export const cardEmptyState = `${r} border border-dashed border-[var(--line-dark)] px-6 py-12 text-center text-[var(--muted)]`;

export const cardFormWrap = `mx-auto max-w-2xl ${r} border border-[var(--line-dark)] bg-white px-8 py-12 text-center sm:px-10 sm:py-14`;

/** Memo / notice blocks — simple copy in a polished white panel */
export const cardMemo = `${r} border border-[var(--line-dark)] bg-white px-6 py-8 sm:px-8 sm:py-10`;

export const cardMemoNarrow = `mx-auto max-w-3xl ${cardMemo}`;

export const cardDarkInset = `${r} border border-white/10 bg-white/[0.04]`;

export const cardDarkInsetPad = `${cardDarkInset} p-4 sm:p-5`;
