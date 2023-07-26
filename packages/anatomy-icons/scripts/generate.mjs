import { transform } from "@svgr/core"
import { readFileSync, writeFileSync } from "fs"
import { format } from "prettier"

const html = String.raw

/* -----------------------------------------------------------------------------
 *  Edit code here
 * -----------------------------------------------------------------------------*/

const name = "RadioGroup"

// prettier-ignore
const svgCode = html`
<svg fill="#2CFF80">
 <path fill-rule="evenodd" clip-rule="evenodd" d="M564.5 372.5C564.5 387.136 552.636 399 538 399C523.364 399 511.5 387.136 511.5 372.5C511.5 357.864 523.364 346 538 346C552.636 346 564.5 357.864 564.5 372.5ZM588.923 426.292C590.29 428.428 591.011 430.914 591 433.45V452H485V433.45C484.989 430.914 485.71 428.428 487.077 426.292C488.444 424.156 490.398 422.459 492.705 421.406C506.988 415.191 522.425 412.07 538 412.25C553.576 412.07 569.012 415.191 583.295 421.406C585.602 422.459 587.557 424.156 588.923 426.292Z" fill="white" fill-opacity="0.8"/>
</svg>
`

/* -----------------------------------------------------------------------------
 * Implmentation
 * -----------------------------------------------------------------------------*/

function toDashCase(str) {
  return str
    .replace(/([A-Z])/g, "-$1")
    .replace(/^-/, "")
    .toLowerCase()
}

const dashName = toDashCase(name)

const defaultPalette = {
  0: "white",
  1: "#2CFF80",
  2: "#2C7A51",
  3: "#16402D",
  4: "#1C4D37",
  5: "#287753",
  6: "#1F8B56",
  7: "#2AB26B",
  8: "#1E6943",
  9: "#C1FFDF",
  10: "#41B883",
  11: "#299464",
  12: "#2AB36B",
  13: "#9FFFCD",
  14: "#0E432B",
}

function findColors(code) {
  const pattern = /"#.*?"/g
  const matches = code.match(pattern) || []
  return Array.from(new Set(matches.map((match) => match.slice(1, -1))))
}

function replaceColors(code) {
  const colors = findColors(code)

  if (colors.length === 0) {
    return code.replaceAll(`"white"`, `{palette[0]}`)
  }

  const regex = new RegExp(
    colors
      .map((c) => `"${c}"`)
      .map((str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|"),
    "g",
  )

  return code
    .replace(regex, (c) => {
      const num = Object.entries(defaultPalette).find((cc) => `"${cc[1]}"` === c)
      return `{palette[${num?.[0]}]}`
    })
    .replaceAll(`"white"`, `{palette[0]}`)
}

const jsxCode = transform.sync(svgCode, {
  plugins: ["@svgr/plugin-jsx"],
})

let template = `
import { createComponent } from "../create-component"

export const ${name}Anatomy = createComponent((props) => {
    const { palette, ...rest } = props
    return (
        ${jsxCode
          .replace('import * as React from "react";\n', "")
          .replace("const SvgComponent = props =>", "")
          .replace("export default SvgComponent;", "")
          .replace("{...props}", "{...rest}")
          .replace("</svg>;", "</svg>")}
    )
})
`

template = await format(replaceColors(template), { parser: "typescript" })

if (process.argv.includes("--dry-run")) {
  console.log(template)
  process.exit(0)
}

writeFileSync(`./src/components/${dashName}.tsx`, template, "utf-8")

const content = readFileSync("./src/components/index.ts", "utf-8").replace(
  "\n\nexport const allComponents = {",
  `
import { ${name}Anatomy } from "./${dashName}"

export const allComponents = {
 "${dashName}": ${name}Anatomy,`,
)

writeFileSync("./src/components/index.ts", content, "utf-8")
