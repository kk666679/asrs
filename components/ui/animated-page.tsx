"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"

interface AnimatedPageProps {
  children: ReactNode
  className?: string
}

export function AnimatedPage({ children, className = "" }: AnimatedPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={`glass-effect rounded-lg p-6 neon-border ${className}`}
    >
      {children}
    </motion.div>
  )
}
