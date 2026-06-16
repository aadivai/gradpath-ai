import type { Metadata } from 'next'
import { SupabaseAuthProvider } from '@/components/providers/SupabaseAuthProvider'
import './globals.css'
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from '@/components/theme-provider'

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'GradPath AI — Study Abroad, Simplified',
  description: 'AI-powered study abroad guidance for Indian students.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseAuthProvider>
      <html lang="en" className={`${geist.variable} scroll-smooth`} suppressHydrationWarning>
        <head>
          <meta name="theme-color" content="#fafafa" media="(prefers-color-scheme: light)" />
          <meta name="theme-color" content="#09090b" media="(prefers-color-scheme: dark)" />
        </head>
        <body className="min-h-full flex flex-col font-sans">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
          >
            {children}
          </ThemeProvider>
          <SpeedInsights />
        </body>
      </html>
    </SupabaseAuthProvider>
  )
}