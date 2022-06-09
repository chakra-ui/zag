/**
 * Test command
 * zag visualize combobox
 * zag visualize --all
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

const delays: Record<string, any> = {
  menu: { LONG_PRESS_DELAY: 700, SUBMENU_OPEN_DELAY: 100, SUBMENU_CLOSE_DELAY: 200 },
  "number-input": { CHANGE_DELAY: 300, CHANGE_INTERVAL: 50 },
  splitter: { HOVER_DELAY: 250 },
  tooltip: { OPEN_DELAY: 1000, CLOSE_DELAY: 500 },
}

type VisualizeOpts = {
  outDir?: string
  all?: boolean
}

const fillVariables = (code: string) => {
  return `"use strict";
    
var _xstate = require("xstate");

const { actions, createMachine, assign } = _xstate;

const { choose } = actions;
const fetchMachine = createMachine(${code})`
}

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
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
  let machineGuards: string[] = []

  traverse(ast, {
    ObjectExpression(path) {
      const targetConditions: ((node: t.ObjectProperty) => boolean)[] = [
        (el) => t.isObjectProperty(el),
        (el) => t.isIdentifier(el.key, { name: "target" }),
        (el) => t.isConditionalExpression(el.value),
      ]

      const isTargetWithConditionalExpression = (el: t.ObjectMethod | t.ObjectProperty | t.SpreadElement) =>
        targetConditions.every((cond) => cond(el as t.ObjectProperty))

      const targetWithConditionalExpression = path.node.properties.find(isTargetWithConditionalExpression)

      if (
        !!targetWithConditionalExpression &&
        t.isObjectProperty(targetWithConditionalExpression) &&
        t.isConditionalExpression(targetWithConditionalExpression.value) &&
        t.isStringLiteral(targetWithConditionalExpression.value.consequent) &&
        t.isStringLiteral(targetWithConditionalExpression.value.alternate) &&
        t.isMemberExpression(targetWithConditionalExpression.value.test) &&
        t.isIdentifier(targetWithConditionalExpression.value.test.property)
      ) {
        const testName = targetWithConditionalExpression.value.test.property.name

        const guardName = `is${capitalizeFirstLetter(testName)}`

        const otherProperties = path.node.properties.filter(
          (n) => !isTargetWithConditionalExpression(n) && (t.isObjectProperty(n) || t.isRestElement(n)),
        ) as (t.ObjectProperty | t.RestElement)[]

        const alternateTarget = t.objectPattern([
          t.objectProperty(
            t.identifier("target"),
            t.stringLiteral(targetWithConditionalExpression.value.alternate.value),
          ),
          ...otherProperties,
        ])

        const consequentTarget = t.objectPattern([
          t.objectProperty(
            t.identifier("target"),
            t.stringLiteral(targetWithConditionalExpression.value.consequent.value),
          ),
          t.objectProperty(t.identifier("guard"), t.stringLiteral(guardName)),
          ...otherProperties,
        ])

        const newPathNode = t.arrayPattern([consequentTarget, alternateTarget])
        path.replaceWith(newPathNode)
      }
    },
  })

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
          path.node.name === "cond" &&
          t.isObjectProperty(path.parentPath.node) &&
          t.isStringLiteral(path.parentPath.node.value)
        ) {
          machineGuards.push(path.parentPath.node.value.value)
        }
      },
    })

    const guardsWithoutDuplicates = [...new Set(machineGuards)]
    const actionsCode = `\nactions: {
  updateContext: assign((context, event) => {
    return {
      [event.contextKey]: true,
    }
  })
},`

    const delaysCode = delays[component]
      ? `\n  delays: {
  ${Object.entries(delays[component]).map(([key, delay]) => `${key}: ${delay}`)}
    },`
      : ""

    const guardsCode = `\n  guards: {
${guardsWithoutDuplicates.map((gua) => `    "${gua}": (ctx) => ctx["${gua}"],`).join("    \n")}
  },`

    const optionsCode = `{
  ${actionsCode} ${delaysCode} ${guardsCode}
}`

    const codeWithOptions = fillVariables(`${machineObjOutput.code}, \n${optionsCode}`)

    const codeWithOptionsAst = parser.parse(codeWithOptions, {})

    let hasGlobalEvents = false

    const updateContextNode = t.objectProperty(
      t.identifier("UPDATE_CONTEXT"),
      t.objectPattern([t.objectProperty(t.identifier("actions"), t.stringLiteral("updateContext"))]),
    )

    traverse(codeWithOptionsAst, {
      Identifier(path) {
        //Add guards to context
        if (path.node.name === "context" && t.isObjectProperty(path.parentPath.node)) {
          path.parentPath.node.value = t.objectPattern(
            machineGuards.map((gua) => t.objectProperty(t.stringLiteral(gua), t.booleanLiteral(false))),
          )
          path.stop()
        }
        //Check for gobal events so we can add the `UPDATE_CONTEXT` event
        if (
          path.node.name === "on" &&
          t.isObjectProperty(path.parentPath.node) &&
          t.isObjectExpression(path.parentPath.node.value) &&
          t.isCallExpression(path.parentPath?.parentPath?.parentPath?.node) &&
          t.isIdentifier(path.parentPath?.parentPath?.parentPath?.node.callee, { name: "createMachine" })
        ) {
          hasGlobalEvents = true
          path.parentPath.node.value.properties = [...path.parentPath.node.value.properties, updateContextNode]
        }
      },
    })

    if (!hasGlobalEvents) {
      //If there's no global events previously, we have to add it for the `UPDATE_CONTEXT` event's sake
      traverse(codeWithOptionsAst, {
        Identifier(path) {
          //Insert the global events right before states
          if (
            path.node.name === "states" &&
            t.isCallExpression(path.parentPath?.parentPath?.parentPath?.node) &&
            t.isIdentifier(path.parentPath?.parentPath?.parentPath?.node.callee, { name: "createMachine" })
          ) {
            const globalEventNode = t.objectProperty(t.identifier("on"), t.objectPattern([updateContextNode]))
            path.parentPath.insertBefore(globalEventNode)
          }
        },
      })
    }

    const codeWithContext = generate(codeWithOptionsAst, {}, codeWithOptions)

    fs.writeFileSync(`${outDir}/${component}.js`, codeWithContext.code)
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
