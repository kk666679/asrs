import * as React from "react"
import { cn } from "@/lib/utils"

interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: {
    default?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: "none" | "sm" | "md" | "lg" | "xl"
}

const gapClasses = {
  none: "gap-0",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
}

function ResponsiveGrid({
  className,
  columns = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = "md",
  children,
  ...props
}: ResponsiveGridProps) {
  const gridClasses = cn(
    "grid",
    columns.default && `grid-cols-${columns.default}`,
    columns.sm && `sm:grid-cols-${columns.sm}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`,
    gapClasses[gap],
    className
  )

  return (
    <div className={gridClasses} {...props}>
      {children}
    </div>
  )
}

export { ResponsiveGrid }
