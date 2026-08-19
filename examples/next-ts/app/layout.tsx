import "@styles/global.css"

import { Suspense } from "react"
import { Sidebar, SidebarFallback } from "@/components/sidebar"

export const metadata = {
  title: "React Machines",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="page">
          <Suspense fallback={<SidebarFallback />}>
            <Sidebar />
          </Suspense>
          {children}
        </div>
      </body>
    </html>
  )
}
