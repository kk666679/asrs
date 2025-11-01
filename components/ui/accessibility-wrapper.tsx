import * as React from "react"
import { cn } from "@/lib/utils"

interface AccessibilityWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  role?: string
  ariaLabel?: string
  ariaDescribedBy?: string
  ariaLabelledBy?: string
  tabIndex?: number
  focusable?: boolean
}

function AccessibilityWrapper({
  className,
  role,
  ariaLabel,
  ariaDescribedBy,
  ariaLabelledBy,
  tabIndex,
  focusable = false,
  children,
  ...props
}: AccessibilityWrapperProps) {
  const accessibilityProps = {
    ...(role && { role }),
    ...(ariaLabel && { "aria-label": ariaLabel }),
    ...(ariaDescribedBy && { "aria-describedby": ariaDescribedBy }),
    ...(ariaLabelledBy && { "aria-labelledby": ariaLabelledBy }),
    ...(focusable && { tabIndex: tabIndex ?? 0 }),
  }

  return (
    <div
      className={cn(className)}
      {...accessibilityProps}
      {...props}
    >
      {children}
    </div>
  )
}

export { AccessibilityWrapper }
