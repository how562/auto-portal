import { notFound } from "next/navigation";
import { StoryDetailForm } from "@/components/admin/StoryDetailForm";
import { getStoryAdmin } from "@/lib/storiesAdmin";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminStoryDetailPage({ params }: PageProps) {
  const { id } = await params;

  if (!isSupabaseAdminConfigured()) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Add <code>SUPABASE_SERVICE_ROLE_KEY</code> to edit stories.
      </p>
    );
  }

  let story: Awaited<ReturnType<typeof getStoryAdmin>> = null;

  try {
    story = await getStoryAdmin(id);
  } catch {
    /* notFound */
  }

  if (!story) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{story.title}</h1>
      <StoryDetailForm story={story} />
    </div>
  );
}
