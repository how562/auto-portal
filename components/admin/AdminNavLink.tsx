"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

type AdminNavLinkProps = ComponentProps<typeof Link>;

/** Sidebar / admin nav link — always a real Next.js navigation target. */
export function AdminNavLink({ href, className, children, ...rest }: AdminNavLinkProps) {
  return (
    <Link href={href} className={className} scroll {...rest}>
      {children}
    </Link>
  );
}
