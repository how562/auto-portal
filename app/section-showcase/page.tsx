import { PortalHeader } from "@/components/layout/PortalHeader";
import { SectionShowcaseView } from "@/components/section-showcase/SectionShowcaseView";

export const dynamic = "force-dynamic";

export default function SectionShowcasePage() {
  return (
    <>
      <PortalHeader />
      <main>
        <SectionShowcaseView />
      </main>
    </>
  );
}
