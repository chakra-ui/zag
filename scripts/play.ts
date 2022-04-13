import { getWorkspacePkgs } from "./build-utils"
import fs from "fs"

const patch = {
  files: ["dist/**/*"],
  scripts: {
    start: "yarn zag build --watch",
    build: "yarn zag build --prod",
    test: "jest --config ../../jest.config.js --rootDir tests",
    lint: "eslint src --ext .ts,.tsx",
    "test:ci": "yarn test --ci --runInBand --updateSnapshot",
    "test:watch": "yarn test --watchAll",
  },
}

async function main() {
  const pkgs = await getWorkspacePkgs()
  for (const { pkg } of pkgs) {
    if (pkg.name === "@zag-js/scripts") continue
    Object.assign(pkg, patch)
    fs.writeFileSync(`${pkg.dir}/package.json`, JSON.stringify(pkg, null, 2))
  }
}

main()
