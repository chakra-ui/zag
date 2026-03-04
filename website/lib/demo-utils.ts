import { readFileSync } from "fs"
import { join } from "path"
import { normalizeComponentName } from "./normalize"

const baseStyle = `* {
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
  border-color: var(--colors-border);
}

:root {
  /* Gray palette */
  --colors-gray-50: #fafafa;
  --colors-gray-100: #f4f4f5;
  --colors-gray-200: #e4e4e7;
  --colors-gray-300: #d4d4d8;
  --colors-gray-400: #a1a1aa;
  --colors-gray-500: #71717a;
  --colors-gray-600: #52525b;
  --colors-gray-700: #3f3f46;
  --colors-gray-800: #27272a;
  --colors-gray-900: #18181b;
  --colors-gray-950: #09090b;

  /* Green palette */
  --colors-green-50: #F0FFF4;
  --colors-green-100: #C6F6D5;
  --colors-green-200: #9AE6B4;
  --colors-green-300: #68D391;
  --colors-green-400: #48BB78;
  --colors-green-500: #38A169;
  --colors-green-600: #2F855A;
  --colors-green-700: #276749;
  --colors-green-800: #22543D;
  --colors-green-900: #1C4532;

  /* Background semantic tokens */
  --colors-bg: white;
  --colors-bg-subtle: white;
  --colors-bg-bold: var(--colors-gray-100);
  --colors-bg-muted: var(--colors-gray-100);
  --colors-bg-popover: white;
  --colors-bg-primary-subtle: var(--colors-green-500);
  --colors-bg-primary-bold: var(--colors-green-600);
  --colors-bg-secondary-subtle: black;
  --colors-bg-secondary-bold: var(--colors-gray-700);
  --colors-bg-tertiary-bold: var(--colors-green-100);
  --colors-bg-tertiary-subtle: var(--colors-green-50);
  --colors-bg-code-block: var(--colors-gray-50);
  --colors-bg-code-inline: rgba(0, 0, 0, 0.06);

  /* Text semantic tokens */
  --colors-text: var(--colors-gray-900);
  --colors-text-bold: var(--colors-gray-950);
  --colors-text-subtle: var(--colors-gray-600);
  --colors-text-muted: var(--colors-gray-500);
  --colors-text-inverse: white;
  --colors-text-primary-bold: var(--colors-green-600);
  --colors-text-primary-subtle: var(--colors-green-700);

  /* Border semantic tokens */
  --colors-border: var(--colors-gray-200);
  --colors-border-subtle: var(--colors-gray-100);
  --colors-border-bold: var(--colors-gray-300);
  --colors-border-primary-subtle: var(--colors-green-500);
  --colors-border-primary-bold: var(--colors-green-600);

  /* Shadow semantic tokens */
  --colors-shadow: rgba(0, 0, 0, 0.24);
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
  const filePath = join(
    process.cwd(),
    "styles",
    "machines",
    `${cssName}.module.css`,
  )
  const moduleStyle = readFileSync(filePath, "utf-8")
  return { baseStyle, moduleStyle }
}

export async function getComponentCode(component: string) {
  const filePath = join(process.cwd(), "demos", `${component}.tsx`)
  return readFileSync(filePath, "utf-8")
    .replace(
      /import styles from ["']\.\.\/styles\/machines\/[\w-]+\.module\.css["']/,
      'import styles from "./styles.module.css"',
    )
    .replace("export function", "export default function")
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
  const { baseStyle: base, moduleStyle } = await getComponentStyle(component)

  return {
    jsxName,
    baseStyle: base,
    moduleStyle,
    code: await getComponentCode(component),
    usage,
  }
}
