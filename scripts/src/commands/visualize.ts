import fs from "fs"
import generate from "@babel/generator"
import traverse from "@babel/traverse"
import * as t from "@babel/types"

import { createLogger } from "../utilities/log"
import { getMachinePackages } from "../utilities/packages"

const parser = require("@babel/parser")

const logger = createLogger("visualize")

const DISALLOWED_PROPERTIES = ["context", "computed", "watch"]

type VisualizeOpts = {
  outFile?: string
}

export default async function visualize(component: string, opts: VisualizeOpts) {
  const { outFile } = opts
  const modules = await getMachinePackages()
  const componentModule = modules.find((module) => module.dir.endsWith(component))
  const machineFile = `${componentModule?.dir}/src/${component}.machine.ts`
  //   const code = fs.readFileSync(machineFile, "utf8")
  const code = fs.readFileSync("./test.ts", "utf8")

  const ast = parser.parse(code, {
    sourceType: "module",
    plugins: ["typescript"],
  })

  //store machine config so we can ignore all other keys
  let machineObj = null

  traverse(ast, {
    ImportDeclaration: function (path) {
      path.remove()
    },

    VariableDeclaration: function (path) {
      path.remove()
    },

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

      if (DISALLOWED_PROPERTIES.includes(path.node.name)) {
        path.parentPath.remove()
      }
    },
  })

  if (machineObj && outFile) {
    const machineObjOutput = generate(machineObj, {}, code)
    fs.writeFileSync(outFile, machineObjOutput.code)
    logger.success(`${component} machine visualization complete. 😎`)
  }
}
