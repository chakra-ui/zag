import { getPackages } from "@manypkg/get-packages"
import path from "path"
import fs from "fs"
import { promisify } from "util"
import { snakeCase } from "lodash"

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

async function getGraph(scopeName: string) {
  const { packages } = await getPackages(process.cwd())

  return packages.reduce(
    (mermaid, { packageJson: { name, dependencies, devDependencies } }) => {
      const allDependencies = Object.keys({
        ...dependencies,
        ...devDependencies,
      })

      const packageName = name.replace(scopeName, "")
      const activeUIDeps = allDependencies
        .filter((v) => v.includes(scopeName))
        .map((v) => v.replace(scopeName, ""))

      const node = `${snakeCase(packageName)}["${packageName}"]`
      const deps = activeUIDeps.map(
        (dep) => `${node} --> ${snakeCase(dep)}["${dep}"];`,
      )

      return [mermaid, node, ...deps].join("\n")
    },
    `graph TD;`,
  )
}

async function replaceInReadme({
  readmePath,
  graph,
}: {
  readmePath: string
  graph: string
}) {
  const content = await readFile(readmePath)
  const lines = String(content).split("\n")
  const startIndex = lines.findIndex((line) =>
    line.includes("dependency-graph-start"),
  )
  const endIndex = lines.findIndex((line) =>
    line.includes("dependency-graph-end"),
  )

  const base64graph = Buffer.from(
    JSON.stringify({
      code: graph,
      mermaid: { theme: "default" },
      updateEditor: false,
    }),
  ).toString("base64")

  const mermaidImage = `![dependency graph](https://mermaid.ink/img/${base64graph})`
  const beforeLines = lines.slice(0, startIndex + 1)
  const afterLines = lines.slice(endIndex)

  const nextContent = [
    ...beforeLines,
    "",
    mermaidImage,
    "",
    ...afterLines,
  ].join("\n")

  await writeFile(readmePath, nextContent)
}

async function main() {
  const shouldReplaceInReadme = process.argv
    .slice(2)
    .includes("--replace-in-readme")
  const graph = await getGraph("@chakra-ui")

  if (shouldReplaceInReadme) {
    await replaceInReadme({ readmePath: path.resolve("./README.md"), graph })
  } else {
    console.log(graph)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
