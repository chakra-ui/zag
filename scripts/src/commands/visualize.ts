/**
 * Test command
 * zag visualize combobox --outFile output.js
 */

import generate from "@babel/generator"
import * as parser from "@babel/parser"
import traverse from "@babel/traverse"
import * as t from "@babel/types"
import fs from "fs"
import { createLogger } from "../utilities/log"
import { getMachinePackages } from "../utilities/packages"

const logger = createLogger("visualize")

const EXCLUDE = new Set(["computed", "created", "onEvent", "watch"])

type VisualizeOpts = {
  outDir?: string
  all?: boolean
}

const fillVariables = (code: string) => {
  return `"use strict";
    
var _xstate = require("xstate");

const {
  actions, createMachine
} = _xstate;

const { choose } = actions;
const fetchMachine = createMachine(${code})`
}

const visualizeComponent = async (component: string, opts: VisualizeOpts) => {
  const { outDir = ".xstate" } = opts
  const modules = await getMachinePackages()
  const componentModule = modules.find((module) => module.dir.endsWith(component))
  const machineFile = `${componentModule?.dir}/src/${component}.machine.ts`
  const code = fs.readFileSync(machineFile, "utf8")
  const ast = parser.parse(code, {
    sourceType: "module",
    plugins: ["typescript"],
  })

  //store machine config so we can ignore all other keys
  let machineObj = null
  let directGuards: string[] = []
  // let coupleGuards: string[][] = []

  traverse(ast, {
    Identifier: function (path) {
      // transform instances of `every` to "invoke interval" object
      if (path.isIdentifier({ name: "every" }) && path.parentPath.node.type === "ObjectProperty") {
        path.node.name = "invoke"
        path.parentPath.node.value = t.objectPattern([
          t.objectProperty(t.identifier("src"), t.stringLiteral("interval")),
          t.objectProperty(t.identifier("id"), t.stringLiteral("interval")),
        ])
      }

      if (path.isIdentifier({ name: "guard" })) {
        path.replaceWithSourceString("cond")
      }

      if (EXCLUDE.has(path.node.name) && t.isObjectProperty(path.parentPath.node)) {
        path.parentPath.remove()
      }
    },

    CallExpression: function (path) {
      //
      const traverseInnerPath = (outerPath: typeof path) => {
        outerPath.traverse({
          CallExpression(innerPath) {
            handleGuards(innerPath)
          },
        })
      }

      const transformAndOr = (tPath: typeof path, separator: string) => {
        const transformedArguments = tPath.node.arguments
          .map((arg) => {
            if (t.isStringLiteral(arg)) {
              const hasMultipleArgs = arg.value.split(" ").length > 1
              return hasMultipleArgs ? `(${arg.value})` : arg.value
            }
          })
          .join(` ${separator} `)
        tPath.replaceWith(t.stringLiteral(transformedArguments))
      }

      const handleNot = (notPath: typeof path) => {
        traverseInnerPath(notPath)

        const notArguments = notPath.node.arguments
        const transformedNotArguments = notArguments
          .map((arg) => {
            if (t.isStringLiteral(arg)) {
              const hasMultipleArgs = arg.value.split(" ").length > 1
              return hasMultipleArgs ? `!(${arg.value})` : `!${arg.value}`
            }
          })
          .join(" ")
        notPath.replaceWith(t.stringLiteral(transformedNotArguments))
      }

      const handleAnd = (andPath: typeof path) => {
        traverseInnerPath(andPath)
        transformAndOr(andPath, "&&")
      }

      const handleOr = (orPath: typeof path) => {
        traverseInnerPath(orPath)
        transformAndOr(orPath, "||")
      }

      const handleGuards = (guardPath: typeof path) => {
        if (t.isIdentifier(guardPath.node.callee)) {
          if (guardPath.node.callee.name === "not") {
            handleNot(guardPath)
          } else if (guardPath.node.callee.name === "and") {
            handleAnd(guardPath)
          } else if (guardPath.node.callee.name === "or") {
            handleOr(guardPath)
          }
        }
      }

      handleGuards(path)

      if (t.isIdentifier(path.node.callee) && path.node.callee.name === "createMachine") {
        machineObj = path.node.arguments[0]
      }
    },
  })

  if (machineObj) {
    const machineObjOutput = generate(machineObj, {}, code)
    const machineWithImports = fillVariables(machineObjOutput.code)

    const outputAst = parser.parse(machineWithImports, {})
    traverse(outputAst, {
      Identifier(path) {
        if (
          t.isObjectProperty(path.parentPath.parentPath?.parentPath?.node) &&
          t.isIdentifier(path.parentPath.parentPath?.parentPath?.node?.key, { name: "on" }) &&
          t.isObjectProperty(path.parentPath.node)
        ) {
          const parentNode = path.parentPath.node

          const guardFilter = (valueProp: t.ObjectProperty | t.ObjectMethod | t.SpreadElement) =>
            t.isObjectProperty(valueProp) && t.isIdentifier(valueProp.key) && valueProp.key.name === "cond"

          if (t.isArrayExpression(parentNode.value) && parentNode.value.elements.length > 0) {
            const eventTargets = parentNode.value.elements
            // let eventGuards: string[] = []
            eventTargets.forEach((target) => {
              if (t.isObjectExpression(target)) {
                const guard = target.properties.find(guardFilter)
                if (t.isObjectProperty(guard) && t.isStringLiteral(guard.value)) {
                  // eventGuards.push(guard.value.value)
                  directGuards.push(guard.value.value)
                }
              }
            })
            // coupleGuards.push(eventGuards)
          } else if (t.isObjectExpression(parentNode.value)) {
            const guard = parentNode.value.properties.find(guardFilter)
            if (t.isObjectProperty(guard) && t.isStringLiteral(guard.value)) {
              directGuards.push(guard.value.value)
            }
          }
        }
      },
    })

    const guardsWithoutDuplicates = [...new Set(directGuards)]
    const guardsCode = `{
  guards: {
${guardsWithoutDuplicates.map((gua) => `  "${gua}": (ctx) => ctx["${gua}"],`).join("    \n")}
  },
}`

    const codeWithGuards = fillVariables(`${machineObjOutput.code}, \n${guardsCode}`)

    fs.writeFileSync(`${outDir}/${component}.js`, codeWithGuards)
    logger.success(`${component} machine visualization complete. 😎`)
  }
}

export default async function visualize(component: string, opts: VisualizeOpts) {
  const { all: shouldVisualizeAll } = opts
  const modules = await getMachinePackages()

  if (shouldVisualizeAll) {
    modules.forEach(async (machine) => {
      const machineName = machine.dir.split("/")[2]
      await visualizeComponent(machineName, opts)
    })
  } else {
    await visualizeComponent(component, opts)
  }
}
