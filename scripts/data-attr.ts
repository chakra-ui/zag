import { ModuleResolutionKind, Node, Project, StringLiteral, SyntaxKind, type ObjectLiteralElementLike } from "ts-morph"
import * as fg from "fast-glob"
import { join, sep } from "path"
import { writeFileSync } from "fs"

const docsMap = {
  "data-state": "The state of the {{widget}}",
  "data-orientation": "The orientation of the {{widget}}",
  "data-active": "Present when active or pressed",
  "data-focus": "Present when focused",
  "data-focus-visible": "Present when focused with keyboard",
  "data-hover": "Present when hovered",
  "data-disabled": "Present when disabled",
  "data-readonly": "Present when read-only",
  "data-required": "Present when required",
  "data-placement": "The placement of the {{widget}}",
  "data-invalid": "Present when invalid",
  "data-current": "Present when current",
  "data-copied": "Present when copied state is true",
  "data-channel": "The color channel of the {{widget}}",
  "data-highlighted": "Present when highlighted",
  "data-today": "Present when the date represents today",
  "data-unavailable": "Present when the date is unavailable based on the min and max date",
  "data-range-start": "Present when is the start of a range",
  "data-range-end": "Present when is the end of a range",
  "data-in-range": "Present when is within the range",
  "data-outside-range": "Present when is outside the range",
  "data-weekend": "Present when is a weekend day",
  "data-view": "The view of the {{widget}}",
  "data-placeholder-shown": "Present when placeholder is shown",
  "data-dragging": "Present when in the dragging state",
  "data-axis": "The axis to resize",
  "data-index": "The index of the item",
  "data-complete": "Present when the {{widget}} value is complete",
  "data-depth": "The depth of the item",
  "data-expanded": "Present when expanded",
  "data-valuetext": "The human-readable value",
  "data-inview": "Present when in viewport",
  "data-type": "The type of the item",
  "data-selected": "Present when selected",
  "data-mounted": "Present when mounted",
  "data-pressed": "Present when pressed",
  "data-paused": "Present when paused",
  "data-checked": "Present when checked",
  "data-overlap": "Present when overlapping",
  "data-path": "The path of the item",
  "data-value": "The value of the item",
}

const skipAttrs = ["data-ownedby", "data-uid"]

/* -----------------------------------------------------------------------------
 * Helpers
 * -----------------------------------------------------------------------------*/

function titleCase(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function dashCase(text: string) {
  return text.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`).replace(/^-+/, "")
}

// replace `rootProps` -> `root`
// replace `getRootProps` -> `root`
function formatName(name: string) {
  return titleCase(name.replace(/^(get)?(.+?)Props$/, "$2"))
}

function getTenaryValues(literal: StringLiteral) {
  const tenaryValues: string[] = []

  literal
    .getParentIfKind(SyntaxKind.PropertyAssignment)
    ?.getChildrenOfKind(SyntaxKind.ConditionalExpression)
    ?.forEach((conditional) => {
      conditional.getDescendantsOfKind(SyntaxKind.StringLiteral).forEach((literal) => {
        tenaryValues.push(literal.getLiteralValue())
      })
    })

  return tenaryValues
}

/* -----------------------------------------------------------------------------
 * ProcessObjectLiteral
 * -----------------------------------------------------------------------------*/

interface ProcessLiteralOptions {
  widget: string
  cb({ part, name, desc }: { part: string; name: string; desc: string }): void
  skipIf?(name: string): boolean
  eval?({ part, name }: { part: string; name: string }): void
}

function processObjectLiteral(node: ObjectLiteralElementLike, opts: ProcessLiteralOptions) {
  const { cb, skipIf, widget, eval: _eval } = opts

  if (Node.isShorthandPropertyAssignment(node)) {
    const name = node.getName()
    const part = formatName(name)
    _eval?.({ part, name })
    return
  }

  if (!Node.isPropertyAssignment(node) && !Node.isMethodDeclaration(node)) return

  const name = node.getName()
  if (skipIf?.(name)) return

  const part = formatName(name)

  node.getDescendantsOfKind(SyntaxKind.StringLiteral).forEach((literal) => {
    const name = literal.getLiteralValue()
    if (!name.startsWith("data-") || skipAttrs.includes(name)) return

    const rep = part === "Root" ? widget : part.startsWith("Item") ? "Item" : part
    let desc = docsMap[name as keyof typeof docsMap]?.replace("{{widget}}", rep.toLowerCase()) ?? ""

    if (name === "data-state") {
      const tenaryValues = getTenaryValues(literal)
      desc = `${tenaryValues.map((x) => JSON.stringify(x)).join(" | ")}`
    }

    cb({ part, name, desc })
  })

  // get all spread properties whose name is dataAttrs
  node.getDescendantsOfKind(SyntaxKind.SpreadAssignment).forEach((spread) => {
    spread.getChildrenOfKind(SyntaxKind.Identifier).forEach((identifier) => {
      _eval?.({ part, name: identifier.getText() })
    })

    spread.getChildrenOfKind(SyntaxKind.CallExpression).forEach((expr) => {
      expr.getChildrenOfKind(SyntaxKind.Identifier).forEach((identifier) => {
        _eval?.({ part, name: identifier.getText() })
      })
    })
  })
}

/* -----------------------------------------------------------------------------
 * Main function
 * -----------------------------------------------------------------------------*/

type DataAttrMap = Record<string, string>

async function main() {
  const project = new Project({
    compilerOptions: {
      moduleResolution: ModuleResolutionKind.NodeNext,
    },
  })

  const files = fg.globSync("packages/machines/*/src/*.connect.ts")

  const json: Record<string, any> = {}

  files.forEach((file) => {
    const widget = file.split(sep)[2]
    project.addSourceFileAtPath(file)

    const sourceFile = project.getSourceFile(file)
    if (!sourceFile) return

    const result: Record<string, DataAttrMap> = {}

    sourceFile.getDescendantsOfKind(SyntaxKind.FunctionDeclaration).forEach((node) => {
      node.getChildrenOfKind(SyntaxKind.Block).forEach((block) => {
        const dataAttrs: Record<string, string> = {}
        const functions: Map<string, DataAttrMap> = new Map()

        // check that the variable name is `dataAttrs`
        block.getChildrenOfKind(SyntaxKind.VariableStatement).forEach((variable) => {
          const [declaration] = variable.getDeclarations()
          const name = declaration.getName()
          if (name !== "dataAttrs") return
          declaration.getChildrenOfKind(SyntaxKind.ObjectLiteralExpression).forEach((obj) => {
            obj.getProperties().forEach((property) => {
              processObjectLiteral(property, {
                widget,
                cb({ name, desc }) {
                  dataAttrs[name] = desc
                },
              })
            })
          })
        })

        block.getChildrenOfKind(SyntaxKind.FunctionDeclaration).forEach((fn) => {
          const fnName = fn.getNameOrThrow()

          if (!fnName.endsWith("Props")) return
          functions.set(fnName, {})

          fn.getDescendantsOfKind(SyntaxKind.ObjectLiteralExpression).forEach((obj) => {
            obj.getProperties().forEach((property) => {
              processObjectLiteral(property, {
                widget,
                cb({ name, desc }) {
                  functions.get(fnName)![name] = desc
                },
              })
            })
          })
        })

        block.getChildrenOfKind(SyntaxKind.ReturnStatement).forEach((returnStatement) => {
          returnStatement.getChildrenOfKind(SyntaxKind.ObjectLiteralExpression).forEach((obj) => {
            obj.getProperties().forEach((property) => {
              processObjectLiteral(property, {
                widget,
                skipIf(name) {
                  return !name.endsWith("Props")
                },
                cb({ part, name, desc }) {
                  result[part] ||= { "data-scope": widget, "data-part": dashCase(part) }
                  result[part][name] = desc
                },
                eval({ part, name }) {
                  if (name === "dataAttrs") {
                    result[part] ||= {}
                    Object.assign(result[part], dataAttrs)
                    return
                  }

                  if (functions.has(name)) {
                    result[part] ||= { "data-scope": widget, "data-part": dashCase(part) }
                    Object.assign(result[part], functions.get(name))
                    return
                  }
                },
              })
            })
          })
        })
      })
    })

    json[widget] = result
  })

  const outPath = join(process.cwd(), "packages", "docs", "data", "data-attr.json")
  writeFileSync(outPath, JSON.stringify(json, null, 2))
}

main()
