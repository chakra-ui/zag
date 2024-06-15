import sdk from "@stackblitz/sdk"

const html = String.raw
const js = String.raw

function normalizeComp(comp: string) {
  if (comp.includes("menu")) comp = "menu"
  return comp
}

async function getStyle(comp: string) {
  comp = normalizeComp(comp)
  const STYLES =
    "https://raw.githubusercontent.com/chakra-ui/zag/main/website/styles/machines"
  // "https://raw.githubusercontent.com/chakra-ui/zag/main/shared/src/css"
  const stylePath = `${STYLES}/${comp}.css`
  return fetch(stylePath).then((r) => r.text())
}

async function getComponent(comp: string) {
  const COMPONENTS =
    // "https://raw.githubusercontent.com/chakra-ui/zag/main/examples/next-ts/pages"
    "https://raw.githubusercontent.com/chakra-ui/zag/main/website/components/machines"
  const componentPath = `${COMPONENTS}/${comp}.tsx`
  let component = await fetch(componentPath).then((r) => r.text())
  component = component.replace("export function", "export default function")
  return component
}

export async function openInStackblitz(comp: string) {
  const component = await getComponent(comp)
  const style = await getStyle(comp)

  const invalidComponent = component === "404: Not Found"
  if (invalidComponent) {
    console.log("Invalid component")
    return null
  }

  sdk.openProject(
    {
      title: `${comp} - Zag`,
      description: `${comp} component zagjs example`,
      template: "node",
      files: {
        "tsconfig.json": JSON.stringify(tsconfig, null, 2),
        "tsconfig.node.json": JSON.stringify(tsconfigNode, null, 2),
        "package.json": JSON.stringify(getPackageJson(comp), null, 2),
        "vite.config.ts": viteConfig,
        "index.html": indexHtml,
        "src/App.tsx": component,
        "src/index.css": style,
        "src/main.tsx": main,
      },
    },
    {
      // clickToLoad: true,
    },
  )
}

const getPackageJson = (comp: string) => {
  comp = normalizeComp(comp)

  return {
    name: "vite-react-typescript-starter",
    private: true,
    version: "0.0.0",
    type: "module",
    scripts: {
      dev: "vite",
      build: "tsc && vite build",
      lint: "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
      preview: "vite preview",
    },
    dependencies: {
      react: "^18.3.1",
      "react-dom": "^18.3.1",
      "@zag-js/react": "latest",
      [`@zag-js/${comp}`]: "latest",
      "react-icons": "latest",
    },
    devDependencies: {
      "@types/react": "^18.3.3",
      "@types/react-dom": "^18.3.0",
      "@vitejs/plugin-react": "^4.3.0",
      "@typescript-eslint/eslint-plugin": "^7.10.0",
      "@typescript-eslint/parser": "^7.10.0",
      eslint: "^8.57.0",
      "eslint-plugin-react-hooks": "^4.6.2",
      "eslint-plugin-react-refresh": "^0.4.7",
      typescript: "^5.2.2",
      vite: "^5.2.11",
    },
  }
}

const viteConfig = js`import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})`

const indexHtml = html` <!doctype html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <link rel="icon" type="image/svg+xml" href="/vite.svg" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Vite + React + TS</title>
    </head>
    <body>
      <div id="root"></div>
      <script type="module" src="/src/main.tsx"></script>
    </body>
  </html>`

const main = js`import React from 'react'
  import ReactDOM from 'react-dom/client'
  import App from './App.tsx'
  import './index.css'
  
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App controls={{} as any} />
    </React.StrictMode>,
  )`

const tsconfig = {
  compilerOptions: {
    target: "ES2020",
    useDefineForClassFields: true,
    lib: ["ES2020", "DOM", "DOM.Iterable"],
    module: "ESNext",
    skipLibCheck: true,

    /* Bundler mode */
    moduleResolution: "bundler",
    allowImportingTsExtensions: true,
    resolveJsonModule: true,
    isolatedModules: true,
    noEmit: true,
    jsx: "react-jsx",

    /* Linting */
    strict: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
    noFallthroughCasesInSwitch: true,
  },
  include: ["src"],
  references: [{ path: "./tsconfig.node.json" }],
}

const tsconfigNode = {
  compilerOptions: {
    composite: true,
    skipLibCheck: true,
    module: "ESNext",
    moduleResolution: "bundler",
    allowSyntheticDefaultImports: true,
    strict: true,
  },
  include: ["vite.config.ts"],
}
