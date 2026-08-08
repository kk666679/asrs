// Theme configuration for consistent styling across the application

export const themeConfig = {
  colors: {
    primary: {
      blue: '#3b82f6',
      cyan: '#06b6d4',
      purple: '#8b5cf6',
      emerald: '#10b981',
      yellow: '#f59e0b',
      red: '#ef4444',
    },
    glass: {
      background: 'rgba(15, 23, 42, 0.7)',
      border: 'rgba(59, 130, 246, 0.2)',
      hover: 'rgba(59, 130, 246, 0.1)',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(59, 130, 246, 0.8)',
      muted: 'rgba(59, 130, 246, 0.6)',
    }
  },
  
  animations: {
    pageTransition: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      transition: { duration: 0.6 }
    },
    
    staggerContainer: {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
      }
    },
    
    staggerItem: {
      hidden: { opacity: 0, y: 20, scale: 0.9 },
      show: { opacity: 1, y: 0, scale: 1 }
    },
    
    hover: {
      scale: 1.05,
      y: -5,
      transition: { duration: 0.2 }
    },
    
    tap: {
      scale: 0.95
    }
  },
  
  shadows: {
    glow: {
      blue: 'hover:shadow-2xl hover:shadow-blue-500/20',
      cyan: 'hover:shadow-2xl hover:shadow-cyan-500/20',
      emerald: 'hover:shadow-2xl hover:shadow-emerald-500/20',
      purple: 'hover:shadow-2xl hover:shadow-purple-500/20',
      yellow: 'hover:shadow-2xl hover:shadow-yellow-500/20',
      red: 'hover:shadow-2xl hover:shadow-red-500/20',
    }
  },
  
  components: {
    card: 'glass-effect neon-border rounded-xl p-6',
    button: 'glass-effect neon-border',
    input: 'glass-effect neon-border',
    header: 'glass-effect neon-border rounded-xl p-6',
  }
}

export const getColorByStatus = (status: string) => {
  const statusColors = {
    active: themeConfig.colors.primary.emerald,
    working: themeConfig.colors.primary.emerald,
    idle: themeConfig.colors.primary.cyan,
    maintenance: themeConfig.colors.primary.yellow,
    error: themeConfig.colors.primary.red,
    offline: '#6b7280',
    online: themeConfig.colors.primary.emerald,
  }
  
  return statusColors[status.toLowerCase() as keyof typeof statusColors] || themeConfig.colors.primary.blue
}

export const getGlowClass = (color: keyof typeof themeConfig.shadows.glow) => {
  return themeConfig.shadows.glow[color]
}