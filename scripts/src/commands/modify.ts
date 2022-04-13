import fs from "fs"
import relative from "relative"
import { getWorkspacePackages } from "../utilities/packages"

export default async function modify() {
  const pkgs = await getWorkspacePackages()

  for (const { pkg, dir } of pkgs) {
    const jestConfig = relative(dir, "jest.config.js")
    const patch = {
      files: ["dist/**/*"],
      scripts: {
        "build:fast": "zag build",
        start: "zag build --watch",
        build: "zag build --prod",
        test: `jest --config ${jestConfig} --rootDir . --passWithNoTests`,
        lint: "eslint src --ext .ts,.tsx",
        "test:ci": "yarn test --ci --runInBand",
        "test:watch": "yarn test --watch --updateSnapshot",
      },
    }

    Object.assign(pkg, patch)
    fs.writeFileSync(`${dir}/package.json`, JSON.stringify(pkg, null, 2))
  }
}
