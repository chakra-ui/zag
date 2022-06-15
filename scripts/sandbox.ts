import { getWorkspacePackages } from "./src/utilities/packages"
import fs from "fs"

async function main() {
  const pkgs = await getWorkspacePackages()
  pkgs.forEach((item) => {
    if (!item.pkg.scripts) return

    item.pkg.scripts = {
      build: "tsup src/index.ts --format esm,cjs --dts",
      dev: "tsup src/index.ts --format esm,cjs --watch --onSuccess 'yarn zag types'",
      clean: "rm -rf .turbo && rm -rf node_modules && rm -rf dist",
    }

    fs.writeFileSync(`${item.dir}/package.json`, JSON.stringify(item.pkg, null, 2))
  })
}

main()
