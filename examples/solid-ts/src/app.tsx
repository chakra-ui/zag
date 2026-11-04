import { createRouter } from "@solidjs/router"
import "@styles/global.css"
import "@styles/playground.css"
import { lazy, Loading, onSettled, type Component } from "solid-js"
import { Shell } from "~/components/shell/shell"

const pages = import.meta.glob<{ default: Component }>("./routes/**/*.tsx")

function toPath(file: string) {
  const segments = file
    .replace(/^\.\/routes\//, "")
    .replace(/\.tsx$/, "")
    .split("/")
    .filter((segment) => segment !== "index")
    .map((segment) => segment.replace(/^\[\.\.\.(.+)\]$/, "*$1").replace(/^\[(.+)\]$/, ":$1"))
  return `/${segments.join("/")}`
}

const routes = Object.entries(pages).map(([file, load]) => ({
  path: toPath(file),
  component: lazy(load),
}))

routes.sort((a, b) => Number(a.path.startsWith("/*")) - Number(b.path.startsWith("/*")))

const Router = createRouter({ routes })

export default function App() {
  return (
    <Router>
      {(props) => (
        <Shell>
          <Loading>
            {props.children}
            <Ready />
          </Loading>
        </Shell>
      )}
    </Router>
  )
}

// e2e waits for this before interacting
function Ready() {
  onSettled(() => {
    document.documentElement.dataset.ready = ""
  })
  return null
}
