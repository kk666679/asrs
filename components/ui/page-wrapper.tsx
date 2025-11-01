"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface PageWrapperProps {
  children: React.ReactNode
  className?: string
  title?: string
  description?: string
  showHeader?: boolean
}

export function PageWrapper({ 
  children, 
  className, 
  title, 
  description, 
  showHeader = true 
}: PageWrapperProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {showHeader && (title || description) && (
        <motion.div 
          className="glass-effect neon-border rounded-xl p-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {title && (
            <h1 className="text-3xl font-bold gradient-text mb-2">{title}</h1>
          )}
          {description && (
            <p className="text-blue-300/80">{description}</p>
          )}
        </motion.div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        {children}
      </motion.div>
    </div>
  )
}