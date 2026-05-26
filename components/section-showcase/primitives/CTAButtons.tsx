import Link from "next/link";
import {
  btnLightMd,
  btnOnDarkMd,
  btnPrimaryMd,
  btnSecondaryMd,
} from "@/lib/buttonClasses";

export interface ShowcaseCta {
  label: string;
  href: string;
  variant?: "primary" | "secondary" | "light" | "on_dark";
}

export function CTAButtons({
  buttons,
  className = "",
}: {
  buttons: ShowcaseCta[];
  className?: string;
}) {
  if (buttons.length === 0) return null;

  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 ${className}`.trim()}
    >
      {buttons.map((button) => {
        const variant = button.variant ?? "primary";
        const className =
          variant === "primary"
            ? `${btnPrimaryMd} min-h-[3rem] min-w-[10.5rem]`
            : variant === "light"
              ? `${btnLightMd} min-h-[3rem] min-w-[10.5rem]`
              : variant === "on_dark"
                ? `${btnOnDarkMd} min-h-[3rem] min-w-[10.5rem]`
                : `${btnSecondaryMd} min-h-[3rem] min-w-[10.5rem]`;

        return (
          <Link key={`${button.label}-${button.href}`} href={button.href} className={className}>
            {button.label}
          </Link>
        );
      })}
    </div>
  );
}
