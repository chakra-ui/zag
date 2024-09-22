import { Plugin } from "vite"
import {
  Project,
  SyntaxKind,
  Node,
  FunctionDeclaration,
  ArrowFunction,
  Expression,
  SourceFile,
  MethodDeclaration,
  FunctionExpression,
} from "ts-morph"

type Func = FunctionDeclaration | FunctionExpression | ArrowFunction

/**
 * Vite plugin to wrap event handlers and functions in `connect` functions
 * from `@zag-js` packages with Qwik's `$()`
 */
export function qwikZag(): Plugin {
  return {
    name: "vite-plugin-qwik-zag",
    enforce: "pre",
    async transform(code, id) {
      // Only process files ending with .connect.ts
      if (!id.endsWith(".connect.ts")) return null

      // Initialize ts-morph project with in-memory file system
      const project = new Project({
        useInMemoryFileSystem: true,
        compilerOptions: {
          target: 5, // ES5
          module: 1, // CommonJS
        },
      })

      // Add the source file to the project
      const sourceFile = project.createSourceFile(id, code)
      let modified = false

      // Find the 'connect' function in the source file
      const connectFunction = findConnectFunction(sourceFile)
      if (!connectFunction) return null // Exit if no 'connect' function is found

      // Process the 'connect' function to wrap necessary functions
      modified = processConnectFunction(connectFunction) || modified

      if (modified) {
        // Ensure that $ is imported from '@builder.io/qwik' if it's used
        addImportIfNeeded(sourceFile)

        // Return the transformed code to Vite
        return {
          code: sourceFile.getFullText(),
          map: null, // Let Vite handle source maps
        }
      }

      return null // No modifications were made
    },
  }
}

/**
 * Finds the 'connect' function in the source file.
 * Handles both function declarations and variable declarations.
 */
function findConnectFunction(sourceFile: SourceFile): Func | undefined {
  // Try to find a function declaration named 'connect'
  const connectFunction = sourceFile.getFunction("connect")
  if (connectFunction) return connectFunction

  // If not found, try to find a variable declaration named 'connect'
  const connectVariableDeclaration = sourceFile.getVariableDeclaration("connect")
  if (connectVariableDeclaration) {
    const initializer = connectVariableDeclaration.getInitializer()
    if (Node.isArrowFunction(initializer) || Node.isFunctionExpression(initializer)) {
      return initializer
    }
  }

  return undefined
}

/**
 * Processes the 'connect' function to wrap event handlers and other functions.
 */
function processConnectFunction(func: Func): boolean {
  let modified = false

  // Collect nodes to wrap without modifying the AST during traversal
  const nodesToWrap: Node[] = []

  // Process the function body to collect functions defined in 'connect'
  processFunctionBody(func, nodesToWrap)

  // Process return statements to collect functions in returned objects
  const returnStatements = func.getDescendantsOfKind(SyntaxKind.ReturnStatement)
  returnStatements.forEach((returnStmt) => {
    const expr = returnStmt.getExpression()
    if (expr) {
      collectNodesToWrap(expr, nodesToWrap)
    }
  })

  // Perform the transformations on the collected nodes
  nodesToWrap.forEach((node) => {
    if (node.wasForgotten()) return

    if (Node.isFunctionDeclaration(node)) {
      wrapFunctionDeclaration(node)
    } else if (Node.isFunctionExpression(node) || Node.isArrowFunction(node)) {
      wrapFunctionExpression(node)
    } else if (Node.isMethodDeclaration(node)) {
      wrapMethodDeclaration(node)
    }
    modified = true
  })

  return modified
}

/**
 * Processes the function body of 'connect' to collect functions to wrap.
 */
function processFunctionBody(func: Func, nodesToWrap: Node[]) {
  const bodyStatements = (func.getBody() as FunctionDeclaration)?.getStatements() || []

  bodyStatements.forEach((statement) => {
    // Process function declarations (e.g., function increment() { ... })
    if (Node.isFunctionDeclaration(statement)) {
      const funcDecl = statement
      if (shouldWrapFunctionDeclaration(funcDecl)) {
        nodesToWrap.push(funcDecl)
      }
    }

    // Process variable declarations with function expressions (e.g., const decrement = () => { ... })
    if (Node.isVariableStatement(statement)) {
      const declarations = statement.getDeclarationList().getDeclarations()
      declarations.forEach((declaration) => {
        const initializer = declaration.getInitializer()
        if (isFunction(initializer)) {
          if (shouldWrapFunctionExpression(declaration.getName(), initializer)) {
            nodesToWrap.push(initializer)
          }
        }
      })
    }
  })
}

/**
 * Recursively collects nodes (functions, properties) to wrap from expressions.
 */
function collectNodesToWrap(expr: Expression, nodesToWrap: Node[], visitedNodes = new Set<Node>()) {
  if (visitedNodes.has(expr)) {
    return
  }
  visitedNodes.add(expr)

  if (Node.isObjectLiteralExpression(expr)) {
    expr.getProperties().forEach((prop) => {
      if (Node.isPropertyAssignment(prop)) {
        const name = prop.getName()
        const initializer = prop.getInitializer()

        if (initializer && isFunction(initializer) && shouldWrapProperty(name, initializer)) {
          // Collect the function initializer, not the property assignment
          nodesToWrap.push(initializer)
        } else if (initializer) {
          collectNodesToWrap(initializer, nodesToWrap, visitedNodes)
        }
      } else if (Node.isMethodDeclaration(prop)) {
        const name = prop.getName()

        if (shouldWrapProperty(name, prop)) {
          nodesToWrap.push(prop)
        } else {
          const body = prop.getBody()
          if (body) {
            const returnStmts = body.getDescendantsOfKind(SyntaxKind.ReturnStatement)
            returnStmts.forEach((retStmt) => {
              const retExpr = retStmt.getExpression()
              if (retExpr) {
                collectNodesToWrap(retExpr, nodesToWrap, visitedNodes)
              }
            })
          }
        }
      } else if (Node.isSpreadAssignment(prop)) {
        const expression = prop.getExpression()
        collectNodesToWrap(expression, nodesToWrap, visitedNodes)
      }
    })
  } else if (Node.isCallExpression(expr)) {
    // Handle call expressions, e.g., normalize.element({...})
    expr.getArguments().forEach((arg) => {
      collectNodesToWrap(arg as Expression, nodesToWrap, visitedNodes)
    })
  } else if (Node.isFunctionExpression(expr) || Node.isArrowFunction(expr)) {
    // Handle function expressions and arrow functions
    const body = expr.getBody()
    if (Node.isBlock(body)) {
      body.getStatements().forEach((stmt) => {
        if (Node.isReturnStatement(stmt)) {
          const returnExpr = stmt.getExpression()
          if (returnExpr) {
            collectNodesToWrap(returnExpr, nodesToWrap, visitedNodes)
          }
        }
      })
    } else {
      collectNodesToWrap(body as Expression, nodesToWrap, visitedNodes)
    }
  } else if (Node.isParenthesizedExpression(expr)) {
    // Unwrap parenthesized expressions
    collectNodesToWrap(expr.getExpression(), nodesToWrap, visitedNodes)
  }
}

/**
 * Wraps a function declaration with Qwik's `$()`.
 * Converts it into a variable declaration with a wrapped function expression.
 */
function wrapFunctionDeclaration(funcDecl: FunctionDeclaration) {
  const name = funcDecl.getName()
  if (!name) return

  // Gather necessary information before modifying the AST
  const isAsync = funcDecl.isAsync() ? "async " : ""
  const parameters = funcDecl
    .getParameters()
    .map((param) => param.getText())
    .join(", ")
  const body = funcDecl.getBody()
  const bodyText = body ? body.getFullText() : "{}"

  // Create the function expression text
  const functionExpressionText = `${isAsync}function(${parameters})${bodyText}`

  // Wrap with $()
  const wrappedFunctionText = `const ${name} = $(${functionExpressionText})`

  // Replace the function declaration with the variable declaration
  funcDecl.replaceWithText(wrappedFunctionText)
}

/**
 * Wraps a method declaration in an object literal with Qwik's `$()`.
 * Converts it into a property assignment with a wrapped function expression.
 */
function wrapMethodDeclaration(method: MethodDeclaration) {
  const name = method.getName()

  // Gather necessary information before modifying the AST
  const isAsync = method.isAsync() ? "async " : ""
  const parameters = method
    .getParameters()
    .map((param) => param.getText())
    .join(", ")
  const body = method.getBody()
  const bodyText = body ? body.getFullText() : "{}"

  // Create the function expression text
  const functionExpressionText = `${isAsync}function(${parameters})${bodyText}`

  // Wrap with $()
  const wrappedFunctionText = `${name}: $(${functionExpressionText})`

  // Replace the method declaration with the property assignment
  method.replaceWithText(wrappedFunctionText)
}

/**
 * Wraps a function expression or arrow function with Qwik's `$()`.
 */
function wrapFunctionExpression(initializer: FunctionExpression | ArrowFunction) {
  // Check if the function is already wrapped with $()
  const parent = initializer.getParent()
  if (
    Node.isCallExpression(parent) &&
    Node.isIdentifier(parent.getExpression()) &&
    parent.getExpression().getText() === "$"
  ) {
    // Already wrapped
    return
  }

  // Collect necessary information before modifying the AST
  const initializerText = initializer.getText()

  // Wrap with $()
  const wrappedInitializerText = `$(${initializerText})`

  // Replace the initializer
  initializer.replaceWithText(wrappedInitializerText)
}

/**
 * Ensures that `$` is imported from '@builder.io/qwik' if it's used.
 * Adds the import statement if it's not already present.
 */
function addImportIfNeeded(sourceFile: SourceFile) {
  // Check if $ is already imported
  const hasImport = sourceFile.getImportDeclarations().some((importDecl) => {
    const moduleSpecifier = importDecl.getModuleSpecifierValue()
    if (moduleSpecifier === "@builder.io/qwik") {
      const namedImports = importDecl.getNamedImports()
      return namedImports.some((namedImport) => namedImport.getName() === "$")
    }
    return false
  })

  if (!hasImport) {
    // Check if there's an existing import from '@builder.io/qwik' to add $ to
    const existingImport = sourceFile.getImportDeclarations().find((importDecl) => {
      return importDecl.getModuleSpecifierValue() === "@builder.io/qwik"
    })

    if (existingImport) {
      // Add $ to the existing import
      existingImport.addNamedImport("$")
    } else {
      // Add new import { $ } from '@builder.io/qwik';
      sourceFile.addImportDeclaration({
        namedImports: ["$"],
        moduleSpecifier: "@builder.io/qwik",
      })
    }
  }
}

/**
 * Checks if a node is a function expression or arrow function.
 */
function isFunction(node: Node | undefined): node is FunctionExpression | ArrowFunction {
  return node ? Node.isFunctionExpression(node) || Node.isArrowFunction(node) : false
}

/**
 * Determines whether a function declaration should be wrapped.
 * e.g. function increment() { ... }
 */
function shouldWrapFunctionDeclaration(funcDecl: FunctionDeclaration): boolean {
  // Same logic as shouldWrapFunctionExpression
  return false
}

/**
 * Determines whether a function expression should be wrapped.
 * e.g. const decrement = () => { ... }
 */
function shouldWrapFunctionExpression(name: string, initializer: FunctionExpression | ArrowFunction): boolean {
  // Future adjustments:
  // - Add conditions based on the function name or other criteria
  return false
}

/**
 * Determines whether a property in an object literal should be wrapped.
 * e.g. { onClick: () => { ... }, onFocus() { ... } }
 */
function shouldWrapProperty(name: string, initializer: Node | undefined): boolean {
  // Wrap properties whose names start with 'on' i.e. event handlers
  if (name.startsWith("on")) {
    return true
  }

  // Future adjustments:
  // - Wrap properties whose initializers meet certain conditions
  return false
}
