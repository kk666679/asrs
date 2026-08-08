"use client"

import * as React from "react"
import { motion, Variants } from "framer-motion"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface AnimatedCardProps extends React.ComponentProps<typeof Card> {
  delay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  variant?: 'default' | 'slide' | 'fade' | 'scale' | 'bounce'
  hover?: boolean
  animate?: boolean
}

const cardVariants: Record<string, Variants> = {
  default: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  slide: {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 }
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  scale: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 }
  },
  bounce: {
    initial: { opacity: 0, y: -100 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 100 }
  }
}

function AnimatedCard({
  className,
  delay = 0,
  duration = 0.5,
  direction = 'up',
  variant = 'default',
  hover = true,
  animate = true,
  children,
  ...props
}: AnimatedCardProps) {
  const getDirectionalVariant = () => {
    if (variant !== 'default') return cardVariants[variant]
    
    switch (direction) {
      case 'up': return { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 } }
      case 'down': return { initial: { y: -20, opacity: 0 }, animate: { y: 0, opacity: 1 } }
      case 'left': return { initial: { x: 20, opacity: 0 }, animate: { x: 0, opacity: 1 } }
      case 'right': return { initial: { x: -20, opacity: 0 }, animate: { x: 0, opacity: 1 } }
      default: return cardVariants.default
    }
  }

  const cardContent = (
    <Card className={className} {...props}>
      {children}
    </Card>
  )

  if (animate) {
    return (
      <motion.div
        variants={getDirectionalVariant()}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{
          duration,
          delay,
          ease: [0.25, 0.46, 0.45, 0.94],
          type: variant === 'bounce' ? 'spring' : 'tween',
          bounce: variant === 'bounce' ? 0.4 : undefined
        }}
        whileHover={hover ? { 
          scale: 1.02,
          y: -2,
          transition: { duration: 0.2 }
        } : undefined}
        whileTap={{ scale: 0.98 }}
      >
        {cardContent}
      </motion.div>
    )
  }

  return cardContent
}

export default AnimatedCard
