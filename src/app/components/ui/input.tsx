import * as React from "react";

import { cn } from "./utils";

function Input({ className, type, style, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex w-full min-w-0 border border-border bg-input-background",
        "rounded-[var(--radius)]",
        "text-foreground",
        "placeholder:text-muted-foreground",
        "selection:bg-primary selection:text-primary-foreground",
        "transition-[color,box-shadow,border-color] outline-none",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        "file:text-foreground file:inline-flex file:border-0 file:bg-transparent file:font-medium",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: "var(--font-size-body)",
        fontWeight: "var(--font-weight-normal)" as unknown as number,
        lineHeight: 1.5,
        height: "var(--button-height-default)",
        paddingLeft: "var(--spacing-sm)",
        paddingRight: "var(--spacing-sm)",
        paddingTop: "var(--spacing-xs)",
        paddingBottom: "var(--spacing-xs)",
        ...style,
      }}
      {...props}
    />
  );
}

export { Input };
