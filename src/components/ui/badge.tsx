import * as React from "react"
import { cn } from "@/lib/utils"

const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "secondary" | "outline" | "success"
  }
>(({ className, variant = "default", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
        
        variant === "default" && [
          "bg-primary/10 text-primary",
          "border border-primary/20"
        ],
        variant === "secondary" && [
          "bg-secondary text-secondary-foreground"
        ],
        variant === "outline" && [
          "border border-border/60 bg-transparent text-foreground/70",
          "backdrop-blur-sm"
        ],
        variant === "success" && [
          "bg-emerald-500/10 text-emerald-600",
          "border border-emerald-500/20"
        ],
        
        className
      )}
      {...props}
    />
  )
})
Badge.displayName = "Badge"

export { Badge }
