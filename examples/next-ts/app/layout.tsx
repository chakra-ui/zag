import Script from "next/script"
import { prefsScript } from "@/components/shell/prefs"
import { Shell } from "@/components/shell/shell"
import "@styles/global.css"
import "@styles/playground.css"

export const metadata = {
  title: "Zag Playground",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The prefs script sets data attributes on <html> before hydration
    <html lang="en" suppressHydrationWarning>
      <body>
        <Script id="playground-prefs" strategy="beforeInteractive">
          {prefsScript}
        </Script>
        <Shell>{children}</Shell>
      </body>
    </html>
  )
}
