import { MetaProvider, Title } from "@solidjs/meta"
import { Router } from "@solidjs/router"
import { FileRoutes } from "@solidjs/start/router"
import "@styles/global.css"
import "@styles/playground.css"
import { Suspense, onMount } from "solid-js"
import { Shell } from "~/components/shell/shell"

export default function App() {
  return (
    <Router
      preload
      root={(props) => (
        <MetaProvider>
          <Title>Zag Playground</Title>
          <Shell>
            <Suspense>
              {props.children}
              <Ready />
            </Suspense>
          </Shell>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  )
}

// e2e waits for this before interacting
function Ready() {
  onMount(() => {
    document.documentElement.dataset.ready = ""
  })
  return null
}
