import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center whitespace-nowrap",
    "gap-[var(--spacing-xs)] rounded-[var(--radius-button)]",
    "transition-all shrink-0 cursor-pointer",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
    "outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border border-border bg-background text-foreground hover:bg-muted active:bg-muted/80 dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/90 active:bg-secondary/80",
        ghost:
          "hover:bg-muted hover:text-foreground active:bg-muted/80 dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: [
          "h-[var(--button-height-default)]",
          "px-[var(--spacing-base)] py-[var(--spacing-xs)]",
          "has-[>svg]:px-[var(--spacing-sm)]",
        ].join(" "),
        sm: [
          "h-[var(--button-height-sm)]",
          "gap-[var(--spacing-2xs)]",
          "px-[var(--spacing-sm)]",
          "has-[>svg]:px-[var(--spacing-xs)]",
        ].join(" "),
        lg: [
          "h-[var(--button-height-lg)]",
          "px-[var(--spacing-lg)]",
          "has-[>svg]:px-[var(--spacing-base)]",
        ].join(" "),
        touch: "size-[var(--button-height-lg)]",
        icon: "size-[var(--button-height-default)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
    }
>(({
  className,
  variant,
  size,
  asChild = false,
  style,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: "var(--font-size-small)",
        fontWeight: "var(--font-weight-medium)" as unknown as number,
        lineHeight: 1.5,
        ...style,
      }}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };
