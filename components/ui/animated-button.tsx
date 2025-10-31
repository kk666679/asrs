import * as React from "react"
import { motion } from "framer-motion"
import { Button, buttonVariants } from "./button"
import { cn } from "@/lib/utils"
import { VariantProps } from "class-variance-authority"

interface AnimatedButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  animationPreset?: "fadeIn" | "slideUp" | "neonPulse" | "bounce"
  hoverEffect?: "glow" | "scale" | "lift"
}

const animationPresets = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5, ease: "easeOut" }
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  },
  neonPulse: {
    animate: {
      boxShadow: [
        "0 0 10px rgba(30, 144, 255, 0.3)",
        "0 0 20px rgba(30, 144, 255, 0.6)",
        "0 0 10px rgba(30, 144, 255, 0.3)"
      ]
    },
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  bounce: {
    initial: { scale: 0.8 },
    animate: { scale: 1 },
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20
    }
  }
}

function AnimatedButton({
  className,
  variant,
  size,
  animationPreset = "fadeIn",
  hoverEffect = "glow",
  children,
  ...props
}: AnimatedButtonProps) {
  const hoverEffects = {
    glow: { boxShadow: "0 0 20px rgba(30, 144, 255, 0.6)" },
    scale: { scale: 1.05 },
    lift: { y: -2 }
  }

  return (
    <motion.div
      {...(animationPresets[animationPreset] as any)}
      whileHover={hoverEffects[hoverEffect] as any}
      whileTap={{ scale: 0.95 }}
      className="inline-block"
    >
      <Button
        className={cn(className)}
        variant={variant}
        size={size}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  )
}

export { AnimatedButton }
