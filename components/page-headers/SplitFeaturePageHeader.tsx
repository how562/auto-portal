import { HalfHalfBlock } from "@/components/sections/HalfHalfBlock";
import { halfHalfFromSplitFields } from "@/lib/halfHalfSection";
import type { SplitFeaturePageHeaderFields } from "@/lib/pageHeaderTypes";

import "@/app/page-headers.css";

export function SplitFeaturePageHeader({ data }: { data: SplitFeaturePageHeaderFields }) {
  return (
    <HalfHalfBlock
      {...halfHalfFromSplitFields(data)}
      as="header"
      variant="compact"
      className="ph-split--page-header"
    />
  );
}
