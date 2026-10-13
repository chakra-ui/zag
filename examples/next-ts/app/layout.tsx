import { Wix_Madefor_Text } from "next/font/google"
import { prefsScript } from "@/components/shell/prefs"
import { Shell } from "@/components/shell/shell"
import "@styles/global.css"
import "@styles/playground.css"

// Same font as the website
const sans = Wix_Madefor_Text({ subsets: ["latin"], variable: "--font-sans" })

export const metadata = {
  title: "Zag Playground",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The prefs script sets data attributes on <html> before hydration
    <html lang="en" className={sans.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: prefsScript }} />
      </head>
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  )
}
