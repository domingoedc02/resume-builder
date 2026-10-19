import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive min-h-20 w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-sm transition-colors outline-none focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
