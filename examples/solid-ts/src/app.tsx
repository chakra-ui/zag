import { MetaProvider, Title } from "@solidjs/meta"
import { Router } from "@solidjs/router"
import { FileRoutes } from "@solidjs/start/router"
import "@styles/global.css"
import { Suspense } from "solid-js"
import { Sidebar } from "~/components/sidebar"

export default function App() {
  return (
    <div class="page">
      <Router
        preload
        root={(props) => (
          <MetaProvider>
            <Title>Zag.js + Solid</Title>
            <Sidebar />
            <Suspense>{props.children}</Suspense>
          </MetaProvider>
        )}
      >
        <FileRoutes />
      </Router>
    </div>
  )
}
