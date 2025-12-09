import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { cn } from '@/core/utils'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'StreamApp',
    description: 'Premium Streaming Experience',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="dark">
            <body className={cn(inter.className, "bg-background text-foreground antialiased min-h-screen")}>
                {children}
            </body>
        </html>
    )
}
