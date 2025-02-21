import sdk from "@stackblitz/sdk"
import { normalizeComponentName } from "./normalize"

export async function openInStackblitz(component: string, defaultProps: any) {
  const response = await fetch(`/api/demo`, {
    method: "POST",
    body: JSON.stringify({ component, defaultProps }),
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    console.error(response.statusText)
    return
  }

  const json = await response.json()
  const { jsxName, usage, code, style } = json.demo

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

  const componentName = normalizeComponentName(component)

  const packageJson = {
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
      "@zag-js/react": "0.82.2",
      [`@zag-js/${componentName}`]: "0.82.2",
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

  const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})`

  const indexHtml = `<!doctype html>
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

  const app = `import ${jsxName} from './${jsxName}'

export default function App() {
  return (
    ${usage}
  )
}
`

  const main = `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`

  const files = {
    "tsconfig.json": JSON.stringify(tsconfig, null, 2),
    "package.json": JSON.stringify(packageJson, null, 2),
    "vite.config.ts": viteConfig,
    "index.html": indexHtml,
    [`src/${jsxName}.tsx`]: code,
    "src/App.tsx": app,
    "src/index.css": style,
    "src/main.tsx": main,
  }

  sdk.openProject(
    {
      title: `Zag.js - ${component}`,
      description: `${component} component demo from zag.js.com`,
      template: "node",
      files,
    },
    {
      openFile: `src/App.tsx,src/${jsxName}.tsx`,
      showSidebar: false,
    },
  )
}
