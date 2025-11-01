"use client"

import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedListProps {
  children: React.ReactNode[]
  className?: string
  staggerDelay?: number
  variant?: 'fade' | 'slide' | 'scale'
}

const listVariants = {
  fade: {
    container: {
      animate: {
        transition: {
          staggerChildren: 0.1
        }
      }
    },
    item: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    }
  },
  slide: {
    container: {
      animate: {
        transition: {
          staggerChildren: 0.1
        }
      }
    },
    item: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 }
    }
  },
  scale: {
    container: {
      animate: {
        transition: {
          staggerChildren: 0.1
        }
      }
    },
    item: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.8 }
    }
  }
}

export function AnimatedList({ 
  children, 
  className, 
  staggerDelay = 0.1, 
  variant = 'fade' 
}: AnimatedListProps) {
  const variants = listVariants[variant]

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
      <AnimatePresence>
        {children.map((child, index) => (
          <motion.div
            key={index}
            variants={variants.item}
            layout
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}