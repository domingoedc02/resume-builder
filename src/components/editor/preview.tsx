"use client";

import { useEffect, useRef, useState } from "react";
import { ResumeTemplate } from "@/components/templates";
import { toTemplateModel } from "@/lib/resume/mapping";
import type {
  PageSize,
  ResumeContent,
  ResumeLayout,
  TemplateId,
} from "@/lib/resume/schema";

// CSS px at 96 dpi. Print output (Phase 5) uses real @page breaks instead.
const PAPER: Record<PageSize, { w: number; h: number }> = {
  a4: { w: 794, h: 1123 },
  letter: { w: 816, h: 1056 },
};
const PAD = 56;
const GUIDE = "rgb(148 163 184 / 0.7)";

/** Paper sheet scaled to the column width. Always white, even in dark mode. */
export function Preview({
  content,
  layout,
  templateId,
  pageSize,
}: {
  content: ResumeContent;
  layout: ResumeLayout;
  templateId: TemplateId;
  pageSize: PageSize;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ scale: 1, height: 0 });
  const { w, h } = PAPER[pageSize];

  useEffect(() => {
    const outer = wrap.current;
    const inner = sheet.current;
    if (!outer || !inner) return;
    // ResizeObserver fires once on observe(), so no separate first measure.
    const ro = new ResizeObserver(() => {
      if (outer.clientWidth === 0) return; // hidden tab
      const scale = Math.min(1, outer.clientWidth / w);
      setFit({ scale, height: inner.offsetHeight * scale });
    });
    ro.observe(outer);
    ro.observe(inner);
    return () => ro.disconnect();
  }, [w]);

  const model = toTemplateModel({ content, layout });

  return (
    <div ref={wrap} className="w-full">
      <div style={{ height: fit.height || undefined }}>
        <div
          ref={sheet}
          className="relative bg-white text-neutral-900 ring-1 ring-black/10"
          style={{
            width: w,
            minHeight: h,
            padding: PAD,
            transform: `scale(${fit.scale})`,
            transformOrigin: "top left",
          }}
        >
          <ResumeTemplate model={model} templateId={templateId} />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent ${h - 1}px, ${GUIDE} ${h - 1}px, ${GUIDE} ${h}px)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
