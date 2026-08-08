"use client"

import * as React from "react"

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  theme: Theme | null
  setTheme: (t: Theme) => void
}

export const ThemeContext = React.createContext<ThemeContextValue>({ theme: null, setTheme: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme | null>(null)

  React.useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('theme') : null
    const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    const initial: Theme = (saved as Theme) || (prefersDark ? 'dark' : 'light')

    setThemeState(initial)
    applyThemeClass(initial)
  }, [])

  const applyThemeClass = (t: Theme) => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    if (t === 'dark') {
      root.classList.add('dark')
    } else if (t === 'light') {
      root.classList.remove('dark')
    }
  }

  const setTheme = (t: Theme) => {
    try { localStorage.setItem('theme', t) } catch (e) {}
    setThemeState(t)
    applyThemeClass(t)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
