import { readFileSync } from "fs"
import { normalizeComponentName } from "./normalize"
import { join } from "path"

const baseStyle = `
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

*, *::before, *::after {
  border: 0;
  border-style: solid;
  border-color: var(--colors-border-subtle);
}

html {
  --colors-bg-subtle: #FFFFFF;
  --colors-bg-bold: #EDF2F7;
  --colors-bg-primary-subtle: #38A169;
  --colors-bg-primary-bold: #2F855A;
  --colors-bg-secondary-subtle: #000000;
  --colors-bg-secondary-bold: #2D3748;
  --colors-bg-tertiary-bold: #C6F6D5;
  --colors-bg-tertiary-subtle: #F0FFF4;
  --colors-bg-code-block: hsl(230, 1%, 98%);
  --colors-bg-code-inline: rgba(0, 0, 0, 0.04);
  --colors-bg-header: rgba(255, 255, 255, 0.92);
  --colors-bg-badge: #FEEBC8;
  --colors-text-bold: #171923;
  --colors-text-subtle: #4A5568;
  --colors-text-primary-bold: #38A169;
  --colors-text-inverse: #FFFFFF;
  --colors-text-primary-subtle: #2F855A;
  --colors-text-badge: #C05621;
  --colors-border-subtle: #EDF2F7;
  --colors-border-bold: #E2E8F0;
  --colors-border-primary-subtle: #38A169;
  --colors-border-primary-bold: #2F855A;
}

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
`

export async function getComponentStyle(component: string) {
  const cssName = normalizeComponentName(component)
  const filePath = join(process.cwd(), "styles", "machines", `${cssName}.css`)
  const code = readFileSync(filePath, "utf-8")
  return [baseStyle, code].join("\n")
}

export async function getComponentCode(component: string) {
  const filePath = join(
    process.cwd(),
    "components",
    "machines",
    `${component}.tsx`,
  )
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
  const jsxName = toComponentName(component)
  const usage = `
      <${jsxName} controls={${JSON.stringify(defaultProps, null, 2)}} />
    `

  return {
    jsxName,
    style: await getComponentStyle(component),
    code: await getComponentCode(component),
    usage,
  }
}
