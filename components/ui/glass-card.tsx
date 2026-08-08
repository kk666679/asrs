import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface GlassCardProps extends React.ComponentProps<"div"> {
  variant?: "default" | "elevated" | "minimal"
  animate?: boolean
}

function GlassCard({
  className,
  variant = "default",
  animate = true,
  children,
  ...props
}: GlassCardProps) {
  const variants = {
    default: "bg-glassWhite backdrop-blur-md border border-electricBlue/30 shadow-glass",
    elevated: "bg-glassWhite backdrop-blur-lg border border-neonBlue/50 shadow-neon",
    minimal: "bg-glassWhite/50 backdrop-blur-sm border border-electricBlue/20",
  }

  const cardContent = (
    <div
      className={cn(
        "rounded-xl p-6 text-card-foreground transition-all duration-300",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
        className="cursor-pointer"
      >
        {cardContent}
      </motion.div>
    )
  }

  return cardContent
}

export { GlassCard }
