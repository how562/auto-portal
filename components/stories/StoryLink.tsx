import Link from "next/link";
import type { CavenderStory } from "@/lib/storiesContent";
import { storyHref } from "@/lib/storiesContent";

export function StoryLink({
  story,
  className,
  children,
}: {
  story: CavenderStory;
  className?: string;
  children: React.ReactNode;
}) {
  const href = storyHref(story);

  if (href.startsWith("http://") || href.startsWith("https://")) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
