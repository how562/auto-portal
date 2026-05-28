import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { StoryDetailView } from "@/components/stories/StoryDetailView";
import { PortalFooter } from "@/components/home/PortalFooter";
import { PortalHeader } from "@/components/layout/PortalHeader";
import { LeadCaptureProvider } from "@/components/portal/LeadCaptureContext";
import { BRAND_NAME } from "@/lib/brand";
import { fetchStoryBySlug } from "@/lib/storiesRepository";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const story = await fetchStoryBySlug(params.slug);
  if (!story) return { title: `Stories | ${BRAND_NAME}` };

  return {
    title: `${story.title} | Stories | ${BRAND_NAME}`,
    description: story.excerpt,
  };
}

export default async function StoryDetailPage({ params }: PageProps) {
  const story = await fetchStoryBySlug(params.slug);
  if (!story) notFound();

  const external = story.externalUrl?.trim();
  if (external) {
    redirect(external);
  }

  return (
    <LeadCaptureProvider>
      <PortalHeader />
      <main className="min-h-screen bg-[#0c0c0c] pt-[4.125rem] sm:pt-[4.625rem]">
        <StoryDetailView story={story} />
      </main>
      <PortalFooter />
    </LeadCaptureProvider>
  );
}
