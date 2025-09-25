import { readFileSync } from "fs"
import { join } from "path"
import { normalizeComponentName } from "./normalize"

const baseStyle = `@layer reset, base, tokens, recipes, utilities;

@layer reset {
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }

  *,
  *::before,
  *::after {
    border: 0;
    border-style: solid;
    border-color: var(--colors-border-subtle);
  }
}

@layer tokens {
  html {
    --colors-bg-subtle: #ffffff;
    --colors-bg-bold: #edf2f7;
    --colors-bg-primary-subtle: #38a169;
    --colors-bg-primary-bold: #2f855a;
    --colors-bg-secondary-subtle: #000000;
    --colors-bg-secondary-bold: #2d3748;
    --colors-bg-tertiary-bold: #c6f6d5;
    --colors-bg-tertiary-subtle: #f0fff4;
    --colors-bg-code-block: hsl(230, 1%, 98%);
    --colors-bg-code-inline: rgba(0, 0, 0, 0.04);
    --colors-bg-header: rgba(255, 255, 255, 0.92);
    --colors-bg-badge: #feebc8;
    --colors-text-bold: #171923;
    --colors-text-subtle: #4a5568;
    --colors-text-primary-bold: #38a169;
    --colors-text-inverse: #ffffff;
    --colors-text-primary-subtle: #2f855a;
    --colors-text-badge: #c05621;
    --colors-border-subtle: #edf2f7;
    --colors-border-bold: #e2e8f0;
    --colors-border-primary-subtle: #38a169;
    --colors-border-primary-bold: #2f855a;
  }
}

@layer base {
  body {
    padding: 24px;
    background-color: var(--colors-bg-code-block);
    min-height: 100dvh;
  }

  #root {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
}
`

export async function getComponentStyle(component: string) {
  const cssName = normalizeComponentName(component)
  const filePath = join(process.cwd(), "styles", "machines", `${cssName}.css`)
  const code = readFileSync(filePath, "utf-8")
  return [baseStyle, code].join("\n")
}

export async function getComponentCode(component: string) {
  const filePath = join(process.cwd(), "demos", `${component}.tsx`)
  return readFileSync(filePath, "utf-8").replace(
    "export function",
    "export default function",
  )
}

const toCamelCase = (str: string) =>
  str.replace(/-([a-z])/g, (_, char) => char.toUpperCase())

const upperFirst = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

const toComponentName = (str: string) => upperFirst(toCamelCase(str))

export async function getComponentDemo(component: string, defaultProps: any) {
  const propString = Object.entries(defaultProps)
    .map(([key, value]) => `${key}={${JSON.stringify(value)}}`)
    .join(" ")
  const jsxName = toComponentName(component)
  const usage = `<${jsxName} ${propString} />`

  return {
    jsxName,
    style: await getComponentStyle(component),
    code: await getComponentCode(component),
    usage,
  }
}
