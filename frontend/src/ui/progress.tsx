"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "./utils";

function Progress({
  className,
  value,
  style,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  const progressBg = (style as any)?.["--progress-background"];
  
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "h-full w-full flex-1 transition-all",
          !progressBg && "bg-primary"
        )}
        style={{ 
          transform: `translateX(-${100 - (value || 0)}%)`,
          backgroundColor: progressBg || undefined
        }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
