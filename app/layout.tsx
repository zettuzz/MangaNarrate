import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "MangaNarrate",
  icons: {
    icon: "/logo.png",
  },
  description: "AI-powered manga/manhwa recap script generator",
    generator: 'kissmopwetkooo'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
