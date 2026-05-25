import { CmsDebugScreen } from "@/components/admin/CmsDebugScreen";
import { fetchCmsDebugBySlug } from "@/lib/cmsDebugFetch";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: { slug?: string };
}

export default async function AdminDebugCmsPage({ searchParams }: PageProps) {
  const slug = searchParams.slug?.trim() || "about-us";
  const data = await fetchCmsDebugBySlug(slug);

  return <CmsDebugScreen data={data} />;
}
