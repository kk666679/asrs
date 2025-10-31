import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"

interface AnimatedCardProps extends React.ComponentProps<typeof Card> {
  delay?: number
  animate?: boolean
}

function AnimatedCard({
  className,
  delay = 0,
  animate = true,
  children,
  ...props
}: AnimatedCardProps) {
  const cardContent = (
    <Card className={className} {...props}>
      {children}
    </Card>
  )

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: delay,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
      >
        {cardContent}
      </motion.div>
    )
  }

  return cardContent
}

export default AnimatedCard
