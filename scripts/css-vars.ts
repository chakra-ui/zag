import { resolve } from "node:path"
import { writeFileSync } from "node:fs"
import { glob } from "glob"
import { Project, Node, SyntaxKind } from "ts-morph"

interface CSSVariable {
  name: string
  description: string
  component: string
  part: string
  type: "dynamic" | "static" | "calculated"
  source: "connect" | "style" | "css"
}

interface PartCSSVars {
  [variableName: string]: string
}

interface ComponentCSSVars {
  [partName: string]: PartCSSVars
}

interface AllCSSVars {
  [component: string]: ComponentCSSVars
}

// Common CSS variable descriptions
const cssVarDescriptions: Record<string, string> = {
  // Size and dimensions
  "--width": "The width of the element",
  "--height": "The height of the element",
  "--size": "The size (width and height) of the element",
  "--min-width": "The minimum width of the element",
  "--max-width": "The maximum width of the element",
  "--min-height": "The minimum height of the element",
  "--max-height": "The maximum height of the element",

  // Position and offset
  "--offset": "The offset position of the element",
  "--offset-x": "The horizontal offset position",
  "--offset-y": "The vertical offset position",
  "--transform": "The CSS transform value",
  "--translate-x": "The horizontal translation value",
  "--translate-y": "The vertical translation value",

  // Colors
  "--background": "The background color",
  "--color": "The text color",
  "--border-color": "The border color",
  "--shadow": "The box shadow value",

  // Spacing
  "--padding": "The padding value",
  "--margin": "The margin value",
  "--gap": "The gap between elements",
  "--spacing": "The spacing value",

  // Animation and transition
  "--duration": "The animation or transition duration",
  "--delay": "The animation or transition delay",
  "--timing-function": "The timing function for animations",

  // Slider specific
  "--value": "The current value",
  "--angle": "The angle in degrees",
  "--thumb-offset": "The offset position of the thumb",
  "--thumb-width": "The width of the slider thumb",
  "--thumb-height": "The height of the slider thumb",
  "--thumb-transform": "The transform applied to the thumb",
  "--range-start": "The start position of the range",
  "--range-end": "The end position of the range",

  // Carousel specific
  "--slides-per-page": "The number of slides visible per page",
  "--slide-spacing": "The spacing between slides",
  "--slide-item-size": "The calculated size of each slide item",

  // Progress specific
  "--progress-percent": "The progress percentage value",
  "--progress-width": "The width of the progress bar",

  // Calendar specific
  "--month-offset": "The offset for month positioning",
  "--year-offset": "The offset for year positioning",

  // Splitter specific
  "--splitter-size": "The size of the splitter handle",
  "--panel-size": "The size of the panel",

  // Menu specific
  "--menu-width": "The width of the menu",
  "--item-height": "The height of menu items",

  // Tooltip specific
  "--arrow-size": "The size of the arrow",
  "--arrow-background": "The background color of the arrow",

  // Rating specific
  "--rating-value": "The rating value",
  "--star-size": "The size of rating stars",

  // Avatar specific
  "--avatar-size": "The size of the avatar",

  // Badge specific
  "--badge-size": "The size of the badge",

  // Generic positioning
  "--top": "The top position value",
  "--right": "The right position value",
  "--bottom": "The bottom position value",
  "--left": "The left position value",
  "--z-index": "The z-index value",

  // Border radius
  "--radius": "The border radius value",
  "--border-radius": "The border radius value",

  // Opacity
  "--opacity": "The opacity value",

  // Font
  "--font-size": "The font size",
  "--font-weight": "The font weight",
  "--line-height": "The line height",

  // Layout
  "--columns": "The number of columns",
  "--rows": "The number of rows",
  "--grid-gap": "The gap in grid layout",
}

function generateDescription(varName: string, component: string, part: string): string {
  // Check exact match first
  if (cssVarDescriptions[varName]) {
    return cssVarDescriptions[varName]
  }

  // Generate contextual descriptions based on component and variable name
  const cleanVarName = varName.replace(/^--/, "").replace(/-/g, " ")

  // Handle numbered/indexed variables
  if (varName.includes("-offset-")) {
    return `The offset position for ${cleanVarName.split("offset")[0].trim()}`
  }

  if (varName.includes("-thumb-offset-")) {
    const index = varName.split("-").pop()
    return `The offset position of thumb ${index}`
  }

  // Component-specific patterns
  if (component === "slider" && varName.includes("--slider-")) {
    const property = varName.replace("--slider-", "").replace(/-/g, " ")
    return `The ${property} of the slider`
  }

  if (component === "carousel" && varName.includes("--slide")) {
    const property = varName.replace("--slide-", "").replace(/-/g, " ")
    return `The ${property} for carousel slides`
  }

  if (component === "progress" && varName.includes("--progress")) {
    const property = varName.replace("--progress-", "").replace(/-/g, " ")
    return `The ${property} of the progress indicator`
  }

  // Handle common suffixes
  if (varName.endsWith("-width")) {
    return `The width of the ${part}`
  }
  if (varName.endsWith("-height")) {
    return `The height of the ${part}`
  }
  if (varName.endsWith("-size")) {
    return `The size of the ${part}`
  }
  if (varName.endsWith("-color")) {
    return `The color of the ${part}`
  }
  if (varName.endsWith("-background")) {
    return `The background color of the ${part}`
  }
  if (varName.endsWith("-offset")) {
    return `The offset position of the ${part}`
  }
  if (varName.endsWith("-transform")) {
    return `The transform applied to the ${part}`
  }

  // Default description
  return `The ${cleanVarName} value for the ${part}`
}

function extractCSSVariablesFromConnect(filePath: string, project: Project): CSSVariable[] {
  const sourceFile = project.getSourceFile(filePath)
  if (!sourceFile) return []

  const variables: CSSVariable[] = []
  const component = filePath.split("/").slice(-3, -2)[0] // Extract component name from path

  sourceFile.forEachDescendant((node) => {
    if (Node.isPropertyAssignment(node) && node.getName() === "style") {
      const initializer = node.getInitializer()
      if (Node.isObjectLiteralExpression(initializer)) {
        initializer.getProperties().forEach((prop) => {
          if (Node.isPropertyAssignment(prop)) {
            let name = prop.getName()

            // Clean up the property name - remove surrounding quotes if they exist
            if (name?.startsWith('"') && name?.endsWith('"')) {
              name = name.slice(1, -1)
            }

            // Alternative approach: get from string literal value
            const nameNode = prop.getNameNode()
            if (Node.isStringLiteral(nameNode)) {
              name = nameNode.getLiteralValue()
            }

            if (name?.startsWith("--")) {
              // Try to determine the part from the containing function
              let part = "root"
              const containingFunction = node.getFirstAncestorByKind(SyntaxKind.MethodDeclaration)
              if (containingFunction) {
                const functionName = containingFunction.getName()
                if (functionName?.includes("get") && functionName?.includes("Props")) {
                  part = functionName.replace("get", "").replace("Props", "").toLowerCase()
                  if (part === "") part = "root"
                }
              }

              variables.push({
                name: name,
                description: generateDescription(name, component, part),
                component,
                part,
                type: "dynamic",
                source: "connect",
              })
            }
          }
        })
      }
    }
  })

  return variables
}

function extractCSSVariablesFromStyle(filePath: string, project: Project): CSSVariable[] {
  const sourceFile = project.getSourceFile(filePath)
  if (!sourceFile) return []

  const variables: CSSVariable[] = []
  const component = filePath.split("/").slice(-3, -2)[0]

  sourceFile.forEachDescendant((node) => {
    if (Node.isObjectLiteralExpression(node)) {
      node.getProperties().forEach((prop) => {
        if (Node.isPropertyAssignment(prop)) {
          let name = prop.getName()

          // Clean up the property name - remove surrounding quotes if they exist
          if (name?.startsWith('"') && name?.endsWith('"')) {
            name = name.slice(1, -1)
          }

          // Alternative approach: get from string literal value
          const nameNode = prop.getNameNode()
          if (Node.isStringLiteral(nameNode)) {
            name = nameNode.getLiteralValue()
          }

          if (name?.startsWith("--")) {
            variables.push({
              name: name,
              description: generateDescription(name, component, "root"),
              component,
              part: "root",
              type: "calculated",
              source: "style",
            })
          }
        }
      })
    }
  })

  return variables
}

function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function formatPartName(part: string): string {
  // Convert camelCase and kebab-case to PascalCase
  return part
    .split(/[-_]/)
    .map((word) => capitalizeFirstLetter(word))
    .join("")
}

async function extractAllCSSVariables(): Promise<AllCSSVars> {
  const project = new Project({
    tsConfigFilePath: resolve("tsconfig.json"),
  })

  const tempVariables: CSSVariable[] = []

  // Extract from .connect.ts files
  const connectFiles = await glob("packages/machines/*/src/*.connect.ts")
  for (const file of connectFiles) {
    const filePath = resolve(file)
    const variables = extractCSSVariablesFromConnect(filePath, project)
    tempVariables.push(...variables)
  }

  // Extract from .style.ts files
  const styleFiles = await glob("packages/machines/*/src/*.style.ts")
  for (const file of styleFiles) {
    const filePath = resolve(file)
    const variables = extractCSSVariablesFromStyle(filePath, project)
    tempVariables.push(...variables)
  }

  // Transform to match data-attr.json structure
  const allVariables: AllCSSVars = {}

  for (const variable of tempVariables) {
    const component = variable.component
    const partName = formatPartName(variable.part)

    if (!allVariables[component]) {
      allVariables[component] = {}
    }
    if (!allVariables[component][partName]) {
      allVariables[component][partName] = {}
    }

    allVariables[component][partName][variable.name] = variable.description
  }

  return allVariables
}

async function main() {
  console.log("Extracting CSS variables...")

  const allVariables = await extractAllCSSVariables()

  const outputPath = resolve("packages/docs/data/css-vars.json")
  writeFileSync(outputPath, JSON.stringify(allVariables, null, 2))

  const totalComponents = Object.keys(allVariables).length
  const totalVariables = Object.values(allVariables).reduce(
    (total, component) =>
      total + Object.values(component).reduce((partTotal, partVars) => partTotal + Object.keys(partVars).length, 0),
    0,
  )

  console.log(`✅ Extracted ${totalVariables} CSS variables from ${totalComponents} components`)
  console.log(`📄 Output saved to: ${outputPath}`)
}

main().catch(console.error)
