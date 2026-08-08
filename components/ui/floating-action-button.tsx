"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FloatingActionButtonProps extends React.ComponentProps<typeof Button> {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  offset?: number
}

const positionClasses = {
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4', 
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4'
}

export const FloatingActionButton = React.forwardRef<
  HTMLButtonElement,
  FloatingActionButtonProps
>(({ className, position = 'bottom-right', offset = 16, children, ...props }, ref) => {
  return (
    <motion.div
      className={cn(
        "fixed z-50",
        positionClasses[position]
      )}
      style={{
        bottom: position.includes('bottom') ? offset : undefined,
        top: position.includes('top') ? offset : undefined,
        right: position.includes('right') ? offset : undefined,
        left: position.includes('left') ? offset : undefined,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
    >
      <Button
        ref={ref}
        className={cn(
          "h-14 w-14 rounded-full shadow-lg",
          className
        )}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  )
})
FloatingActionButton.displayName = "FloatingActionButton"