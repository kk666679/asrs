"use client"

import { motion, AnimatePresence, Variants } from "framer-motion"
import { forwardRef } from "react"
import { cn } from "@/lib/utils"

// Motion variants
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
}

export const slideInLeft: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
}

export const slideInRight: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
}

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 }
}

export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

// Motion components
export const MotionDiv = motion.div
export const MotionSpan = motion.span
export const MotionButton = motion.button
export const MotionCard = motion.div

// Enhanced motion wrapper
interface MotionWrapperProps {
  children: React.ReactNode
  variant?: keyof typeof variants
  delay?: number
  duration?: number
  className?: string
}

const variants = {
  fadeInUp,
  fadeIn,
  slideInLeft,
  slideInRight,
  scaleIn
}

export const MotionWrapper = forwardRef<HTMLDivElement, MotionWrapperProps>(
  ({ children, variant = "fadeInUp", delay = 0, duration = 0.5, className }, ref) => {
    return (
      <motion.div
        ref={ref}
        variants={variants[variant]}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration, delay }}
        className={cn(className)}
      >
        {children}
      </motion.div>
    )
  }
)
MotionWrapper.displayName = "MotionWrapper"

// Stagger children wrapper
interface StaggerWrapperProps {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
}

export const StaggerWrapper = ({ children, className, staggerDelay = 0.1 }: StaggerWrapperProps) => {
  return (
    <motion.div
      variants={{
        animate: {
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
      initial="initial"
      animate="animate"
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}

export { AnimatePresence }