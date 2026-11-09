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
      <head>
        <script dangerouslySetInnerHTML={{ __html: prefsScript }} />
      </head>
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  )
}
