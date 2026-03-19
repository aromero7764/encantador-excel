import * as React from "react"
import { cn } from "@/lib/utils"

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "secondary" | "outline" | "ghost" | "destructive"
    size?: "default" | "sm" | "lg" | "icon"
  }
>(({ className, variant = "default", size = "default", ...props }, ref) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "active:scale-[0.98]",
        
        // Variants
        variant === "default" && [
          "bg-primary text-primary-foreground",
          "hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20",
          "shadow-md shadow-primary/10"
        ],
        variant === "secondary" && [
          "bg-secondary text-secondary-foreground",
          "hover:bg-secondary/80"
        ],
        variant === "outline" && [
          "border-2 border-border/60 bg-transparent",
          "hover:bg-accent hover:border-primary/50 hover:text-accent-foreground",
          "active:scale-[0.98]"
        ],
        variant === "ghost" && [
          "hover:bg-accent hover:text-accent-foreground"
        ],
        variant === "destructive" && [
          "bg-destructive text-destructive-foreground",
          "hover:bg-destructive/90"
        ],
        
        // Sizes
        size === "default" && "h-11 px-6 py-2 text-sm",
        size === "sm" && "h-9 px-4 py-1.5 text-sm rounded-lg",
        size === "lg" && "h-14 px-10 py-3 text-base rounded-xl",
        size === "icon" && "h-10 w-10",
        
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }
