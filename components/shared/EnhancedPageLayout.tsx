"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AccessibilityWrapper } from "@/components/ui/accessibility-wrapper";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Suggestions, Suggestion } from "@/components/ai-elements/suggestion";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff } from "lucide-react";
import type { ReactNode } from "react";

interface QuickAction {
  label: string;
  onClick: (label: string) => void;
  icon?: ReactNode;
}

interface EnhancedPageLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  loading?: boolean;
  isConnected?: boolean;
  quickActions?: QuickAction[];
  headerRight?: ReactNode;
  className?: string;
  skeletonRows?: number;
}

function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-6">
      <div className="glass-effect neon-border rounded-xl p-6">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className={`grid grid-cols-1 md:grid-cols-${Math.min(rows, 4)} gap-4`}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="glass-effect neon-border rounded-xl p-6">
            <Skeleton className="h-6 w-24 mb-3" />
            <Skeleton className="h-10 w-16 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
      <div className="glass-effect neon-border rounded-xl p-6">
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

export function EnhancedPageLayout({
  children,
  title,
  description,
  loading = false,
  isConnected,
  quickActions,
  headerRight,
  className,
  skeletonRows = 4,
}: EnhancedPageLayoutProps) {
  if (loading) {
    return <LoadingSkeleton rows={skeletonRows} />;
  }

  return (
    <ErrorBoundary>
      <AccessibilityWrapper role="main" aria-label={title}>
        <div className={cn("space-y-6", className)}>
          {/* Page Header */}
          <motion.div
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-effect neon-border rounded-xl p-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <h1 className="text-3xl font-bold gradient-text">{title}</h1>
              {description && (
                <p className="text-blue-300/80 mt-1 text-sm">{description}</p>
              )}
              {isConnected !== undefined && (
                <div className="flex items-center gap-2 mt-2">
                  {isConnected ? (
                    <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 text-xs gap-1">
                      <Wifi className="h-3 w-3" /> Live
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-yellow-400 border-yellow-500/30 text-xs gap-1">
                      <WifiOff className="h-3 w-3" /> Offline
                    </Badge>
                  )}
                </div>
              )}
            </div>
            {headerRight && (
              <motion.div
                className="flex items-center gap-2 flex-wrap"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                {headerRight}
              </motion.div>
            )}
          </motion.div>

          {/* Quick Actions */}
          {quickActions && quickActions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <Suggestions>
                {quickActions.map((action) => (
                  <Suggestion
                    key={action.label}
                    suggestion={action.label}
                    onClick={action.onClick}
                    className="glass-effect neon-border text-blue-300 hover:text-white hover:bg-blue-600/30"
                  >
                    {action.icon && <span className="mr-1">{action.icon}</span>}
                    {action.label}
                  </Suggestion>
                ))}
              </Suggestions>
            </motion.div>
          )}

          {/* Page Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {children}
          </motion.div>
        </div>
      </AccessibilityWrapper>
    </ErrorBoundary>
  );
}

/** Stat card for use inside EnhancedPageLayout grids */
interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: ReactNode;
  color?: "blue" | "green" | "yellow" | "red" | "purple" | "cyan";
  delay?: number;
}

const colorMap = {
  blue: "hover:shadow-blue-500/20 text-cyan-400",
  green: "hover:shadow-green-500/20 text-emerald-400",
  yellow: "hover:shadow-yellow-500/20 text-yellow-400",
  red: "hover:shadow-red-500/20 text-red-400",
  purple: "hover:shadow-purple-500/20 text-purple-400",
  cyan: "hover:shadow-cyan-500/20 text-cyan-400",
};

export function StatCard({ label, value, sub, icon, color = "blue", delay = 0 }: StatCardProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        show: { opacity: 1, y: 0, scale: 1 },
      }}
      whileHover={{ scale: 1.04, y: -4, transition: { duration: 0.2 } }}
      className={cn(
        "glass-effect neon-border rounded-xl p-6 hover:shadow-2xl transition-all duration-300",
        colorMap[color]
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-blue-300/70">{label}</p>
        {icon && <span className={colorMap[color]}>{icon}</span>}
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </motion.div>
  );
}

export const statGridVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
