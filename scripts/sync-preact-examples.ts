import { exampleRoutes } from "../shared/src/routes.ts"
import fs from "node:fs"
import path from "node:path"

const ROOT = path.resolve(import.meta.dirname, "..")
const REACT_PAGES = path.join(ROOT, "examples/next-ts/pages")
const PREACT_PAGES = path.join(ROOT, "examples/preact-ts/src/pages")
const REACT_HOOKS = path.join(ROOT, "examples/next-ts/hooks")
const PREACT_HOOKS = path.join(ROOT, "examples/preact-ts/src/hooks")
const REACT_COMPONENTS = path.join(ROOT, "examples/next-ts/components")
const PREACT_COMPONENTS = path.join(ROOT, "examples/preact-ts/src/components")
const REACT_LIB = path.join(ROOT, "examples/next-ts/lib")
const PREACT_LIB = path.join(ROOT, "examples/preact-ts/src/lib")
const ROUTES_FILE = path.join(ROOT, "examples/preact-ts/src/routes.ts")

function transformContent(content: string): string {
  return content
    .replaceAll("@zag-js/react", "@zag-js/preact")
    .replaceAll("lucide-react", "lucide-preact")
    .replaceAll("../../../shared/styles/", "../../../../shared/styles/")
}

function ensureDir(filePath: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
}

function copyTransformed(src: string, dest: string) {
  ensureDir(dest)
  const content = transformContent(fs.readFileSync(src, "utf8"))
  fs.writeFileSync(dest, content)
}

// Copy hooks
for (const file of fs.readdirSync(REACT_HOOKS)) {
  copyTransformed(path.join(REACT_HOOKS, file), path.join(PREACT_HOOKS, file))
}

// Copy components
for (const file of fs.readdirSync(REACT_COMPONENTS)) {
  copyTransformed(path.join(REACT_COMPONENTS, file), path.join(PREACT_COMPONENTS, file))
}

// Copy lib utilities
if (fs.existsSync(REACT_LIB)) {
  for (const file of fs.readdirSync(REACT_LIB)) {
    copyTransformed(path.join(REACT_LIB, file), path.join(PREACT_LIB, file))
  }
}

// Copy example pages from react
let copied = 0
for (const route of exampleRoutes) {
  const rel = route.path.slice(1) + ".tsx"
  const src = path.join(REACT_PAGES, rel)
  const dest = path.join(PREACT_PAGES, rel)

  if (!fs.existsSync(src)) {
    console.warn(`Missing react source for ${route.path}`)
    continue
  }

  copyTransformed(src, dest)
  copied++
}

// Generate routes.ts
const routeEntries = exampleRoutes
  .map((route) => {
    const importPath = `./pages${route.path}`
    return `  { path: "${route.path}", component: lazy(() => import("${importPath}")) },`
  })
  .join("\n")

const routesContent = `import { VNode } from "preact"
import { lazy } from "preact-iso"

interface RouteDefinition {
  path: string
  component: () => VNode<any>
}

export const routes: RouteDefinition[] = [
  {
    path: "/",
    component: lazy(() => import("./pages/home")),
  },
${routeEntries}
  {
    path: "/:component",
    component: lazy(() => import("./pages/component")),
  },
]
`

fs.writeFileSync(ROUTES_FILE, routesContent)

console.log(`Synced ${copied} example pages`)
console.log(`Generated ${exampleRoutes.length + 2} routes`)
