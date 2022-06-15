import fs from "fs"
import path from "path"
import { createLogger } from "../utilities/log"

const logger = createLogger("CLI")

export async function patchTypes() {
  const cwd = process.cwd()
  fs.writeFileSync(path.join(cwd, "dist", "index.d.ts"), 'export * from "../src"')
  logger.log("DTS", "⚡️ Build success")
}
