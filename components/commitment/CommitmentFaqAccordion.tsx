"use client";

import { useState } from "react";
import type { CommitmentFaqItem } from "@/lib/cavenderCommitmentPageContent";

interface CommitmentFaqAccordionProps {
  items: CommitmentFaqItem[];
}

export function CommitmentFaqAccordion({ items }: CommitmentFaqAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <ul className="cc-faq__list">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <li key={item.id} className="cc-faq__item">
            <button
              type="button"
              className="cc-faq__trigger"
              aria-expanded={isOpen}
              onClick={() => setOpenId(isOpen ? null : item.id)}
            >
              <span>{item.question}</span>
              <span className="cc-faq__icon" aria-hidden>
                {isOpen ? "−" : "+"}
              </span>
            </button>
            {isOpen ? (
              <div className="cc-faq__panel">
                <p>{item.answer}</p>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
