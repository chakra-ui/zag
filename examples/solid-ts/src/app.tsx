import { MetaProvider, Title } from "@solidjs/meta"
import { Router } from "@solidjs/router"
import { FileRoutes } from "@solidjs/start/router"
import "@styles/global.css"
import "@styles/playground.css"
import { Suspense } from "solid-js"
import { Shell } from "~/components/shell/shell"

export default function App() {
  return (
    <Router
      preload
      root={(props) => (
        <MetaProvider>
          <Title>Zag Playground</Title>
          <Shell>
            <Suspense>{props.children}</Suspense>
          </Shell>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  )
}
