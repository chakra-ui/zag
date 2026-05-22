import "@styles/global.css"

import { Suspense } from "react"
import { Sidebar } from "@/components/sidebar"

export const metadata = {
  title: "React Machines",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="page">
          <Suspense>
            <Sidebar />
          </Suspense>
          {children}
        </div>
      </body>
    </html>
  )
}
