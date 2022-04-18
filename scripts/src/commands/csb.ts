import { getWorkspacePackages } from "../utilities/packages"
import fs from "fs"
import path from "path"
import { createLogger } from "../utilities/log"

const logger = createLogger("codesandbox")

export default async function csb() {
  const modules = await getWorkspacePackages()
  const cwd = process.cwd()

  const result = modules.map((module) => module.dir)
  const ciPath = path.join(cwd, ".codesandbox/ci.json")

  const ciJson = JSON.parse(fs.readFileSync(ciPath, "utf8"))
  ciJson.packages = result

  fs.writeFileSync(".codesandbox/ci.json", JSON.stringify(ciJson, null, 2))
  logger.success("Successfully patched .codesandbox/ci.json")
}
