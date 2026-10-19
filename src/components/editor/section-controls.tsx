"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { SectionKey, ResumeLayout } from "@/lib/resume/schema";

const LABEL: Record<SectionKey, string> = {
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
};

function SortableSection({
  id,
  hidden,
  onToggle,
}: {
  id: SectionKey;
  hidden: boolean;
  onToggle: (id: SectionKey, hidden: boolean) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`border-border flex items-center gap-3 rounded-md border px-3 py-2 ${isDragging ? "bg-background z-10" : "bg-background"}`}
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        aria-label={`Reorder ${LABEL[id]}`}
        className="text-muted-foreground cursor-grab touch-none select-none active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <span aria-hidden="true">⠿</span>
      </button>
      <span className="flex-1 text-sm">{LABEL[id]}</span>
      <label className="flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          checked={!hidden}
          onChange={(event) => onToggle(id, !event.target.checked)}
        />
        Show
      </label>
    </li>
  );
}

/** Accessible pointer and keyboard reorder; visibility is persisted in layout. */
export function SectionControls({
  layout,
  onChange,
}: {
  layout: ResumeLayout;
  onChange: (next: ResumeLayout) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const hidden = new Set(layout.hidden);

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = layout.order.indexOf(active.id as SectionKey);
    const to = layout.order.indexOf(over.id as SectionKey);
    if (from < 0 || to < 0) return;
    onChange({ ...layout, order: arrayMove(layout.order, from, to) });
  }

  function onToggle(id: SectionKey, isHidden: boolean) {
    onChange({
      ...layout,
      hidden: isHidden
        ? [...new Set([...layout.hidden, id])]
        : layout.hidden.filter((key) => key !== id),
    });
  }

  return (
    <section aria-labelledby="section-order-title" className="grid gap-3">
      <div>
        <h2
          id="section-order-title"
          className="font-serif text-xl tracking-tight"
        >
          Sections
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Drag to reorder. Uncheck Show to hide a section from the resume.
        </p>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={layout.order}
          strategy={verticalListSortingStrategy}
        >
          <ul className="grid gap-2">
            {layout.order.map((id) => (
              <SortableSection
                key={id}
                id={id}
                hidden={hidden.has(id)}
                onToggle={onToggle}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </section>
  );
}
