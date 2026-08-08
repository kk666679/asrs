"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { AnimatePresence, motion } from "framer-motion";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/sonner';
import { queryClient } from '@/lib/query-client';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Leaflet CSS from CDN to avoid bundling in PostCSS pipeline */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-sA+e2QkP0rY2G7X5b0p0m9wqQf9fQw1p4w7d2vZg6kM="
          crossOrigin=""
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 glass-effect border-b border-neonBlue/30">
                  <div className="flex items-center gap-2 px-4">
                    <SidebarTrigger
                      className="-ml-1 hover:glow-neon transition-all duration-300"
                      aria-label="Toggle sidebar"
                    />
                    <div className="h-4 w-px bg-sidebar-border" />
                  </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                  <AnimatePresence mode="wait">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{
                        duration: 0.5,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                      style={{ backdropFilter: "blur(10px)" }}
                      className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 cyber-grid"
                      role="main"
                      aria-label="Main content"
                    >
                      <div className="glass-effect rounded-xl p-8 neon-border hover-glow">
                        {children}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </SidebarInset>
            </SidebarProvider>
          </ThemeProvider>
          <ReactQueryDevtools initialIsOpen={false} />
          <Toaster position="top-right" richColors closeButton />
        </QueryClientProvider>
      </body>
    </html>
  );
}
