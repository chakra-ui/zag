import ts from "typescript"
import type { Machine } from "../../types"
export const ELSE_GUARD = "else_guard"

const TOP_LEVEL_KEYS_TO_EXTRACT = ["on", "effects", "entry", "exit", "states"] as const

function isTopLevelKey(key: string): key is (typeof TOP_LEVEL_KEYS_TO_EXTRACT)[number] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return TOP_LEVEL_KEYS_TO_EXTRACT.includes(key as any)
}

function parseChooseExpression(node: ts.CallExpression, sourceFile: ts.SourceFile) {
  const result: Record<string, string[]> = {}

  if (node.arguments.length === 0) return result

  const arrayArg = node.arguments[0]
  if (!ts.isArrayLiteralExpression(arrayArg)) return result

  for (const element of arrayArg.elements) {
    if (!ts.isObjectLiteralExpression(element)) continue

    let guard: string | null = null
    let actions: string[] = []

    for (const prop of element.properties) {
      if (!ts.isPropertyAssignment(prop)) continue

      const propName = prop.name.getText(sourceFile)

      if (propName === "guard") {
        // For string literals, use the text without quotes
        if (ts.isStringLiteral(prop.initializer)) {
          guard = prop.initializer.text
        } else {
          // For function calls and other expressions, use getText
          guard = prop.initializer.getText(sourceFile)
        }
      } else if (propName === "actions") {
        if (ts.isArrayLiteralExpression(prop.initializer)) {
          actions = prop.initializer.elements.map((e) => (ts.isStringLiteral(e) ? e.text : e.getText(sourceFile)))
        }
      }
    }

    const key = guard || ELSE_GUARD
    result[key] = actions
  }

  return result
}

export function serializeMachine(code: string) {
  // Create a source file
  const sourceFile = ts.createSourceFile("temp.ts", code, ts.ScriptTarget.Latest, true)

  const result = { id: "" } as Machine
  let schemaType: string | null = null

  // Visit nodes to find the createMachine call
  function visit(node: ts.Node) {
    // Find the createMachine call expression
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "createMachine") {
      // Extract schema type from type arguments if present
      if (node.typeArguments && node.typeArguments.length > 0) {
        const typeArg = node.typeArguments[0]
        if (ts.isTypeReferenceNode(typeArg) && ts.isIdentifier(typeArg.typeName)) {
          schemaType = typeArg.typeName.text
          // Convert SchemaType to kebab-case id
          if (schemaType.endsWith("Schema")) {
            const baseName = schemaType.slice(0, -6) // Remove 'Schema' string
            result.id = baseName.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()
          }
        }
      }

      // Process the object literal argument
      if (node.arguments.length > 0 && ts.isObjectLiteralExpression(node.arguments[0])) {
        const configObj = node.arguments[0]

        // Extract properties
        for (const prop of configObj.properties) {
          if (ts.isPropertyAssignment(prop)) {
            const propName = prop.name.getText(sourceFile)

            if (isTopLevelKey(propName)) {
              result[propName] = parseObjectLiteralToJSON(prop.initializer, sourceFile)
            }
          }
        }
      }
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return result
}

function parseObjectLiteralToJSON(
  node: ts.Node,
  sourceFile: ts.SourceFile,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  // Handle object literals
  if (ts.isObjectLiteralExpression(node)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: Record<string, any> = {}

    for (const prop of node.properties) {
      if (ts.isPropertyAssignment(prop)) {
        const propName = getPropertyName(prop.name, sourceFile)
        if (propName) {
          result[propName] = parseObjectLiteralToJSON(prop.initializer, sourceFile)
        }
      }
    }

    return result
  }

  // Handle arrays
  if (ts.isArrayLiteralExpression(node)) {
    return node.elements.map((element) => parseObjectLiteralToJSON(element, sourceFile))
  }

  // Handle choose() expressions
  if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "choose") {
    return parseChooseExpression(node, sourceFile)
  }

  // Handle string literals
  if (ts.isStringLiteral(node)) {
    return node.text
  }

  // Handle numeric literals
  if (ts.isNumericLiteral(node)) {
    return Number(node.text)
  }

  // Handle boolean literals
  if (node.kind === ts.SyntaxKind.TrueKeyword) {
    return true
  }

  if (node.kind === ts.SyntaxKind.FalseKeyword) {
    return false
  }

  // Handle null
  if (node.kind === ts.SyntaxKind.NullKeyword) {
    return null
  }

  // Handle function calls (like guard functions)
  if (ts.isCallExpression(node)) {
    return node.getText(sourceFile)
  }

  // Handle other expressions
  return node.getText(sourceFile)
}

function getPropertyName(node: ts.PropertyName, sourceFile: ts.SourceFile): string | null {
  if (ts.isIdentifier(node)) {
    return node.text
  }

  if (ts.isStringLiteral(node)) {
    return node.text
  }

  if (ts.isComputedPropertyName(node)) {
    return node.expression.getText(sourceFile)
  }

  return null
}
