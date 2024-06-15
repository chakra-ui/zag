import sdk from "@stackblitz/sdk"

const html = String.raw
const js = String.raw

export async function openInStackblitz(component: string) {
  const componentCode = await getComponentCode(component)
  const style = await getStyle(component)

  const invalidComponent = componentCode === "404: Not Found"
  if (invalidComponent) {
    return null
  }

  const files = {
    "tsconfig.json": JSON.stringify(tsconfig, null, 2),
    "package.json": JSON.stringify(getPackageJson(component), null, 2),
    "vite.config.ts": viteConfig,
    "index.html": indexHtml,
    "src/App.tsx": componentCode,
    "src/index.css": style,
    "src/main.tsx": main,
  }

  sdk.openProject({
    title: component,
    description: `${component} component zagjs example`,
    template: "node",
    files,
  })
}

function normalizeComponent(component: string) {
  if (component.includes("menu")) component = "menu"
  return component
}

async function getStyle(component: string) {
  component = normalizeComponent(component)
  const STYLES =
    "https://raw.githubusercontent.com/chakra-ui/zag/main/website/styles/machines"
  const stylePath = `${STYLES}/${component}.css`
  return fetch(stylePath).then((r) => r.text())
}

async function getComponentCode(component: string) {
  const COMPONENTS =
    "https://raw.githubusercontent.com/chakra-ui/zag/main/website/components/machines"
  const componentPath = `${COMPONENTS}/${component}.tsx`
  let code = await fetch(componentPath).then((r) => r.text())
  code = code.replace("export function", "export default function")
  return code
}

const getPackageJson = (component: string) => {
  component = normalizeComponent(component)

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
      [`@zag-js/${component}`]: "latest",
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
    moduleResolution: "bundler",
    allowImportingTsExtensions: true,
    resolveJsonModule: true,
    isolatedModules: true,
    noEmit: true,
    jsx: "react-jsx",
    strict: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
    noFallthroughCasesInSwitch: true,
  },
  include: ["src"],
}
