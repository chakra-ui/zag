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
        "build-fast": "tsup src/index.ts --format=esm,cjs",
        start: "pnpm build --watch",
        build: "pnpm build-fast --dts",
        test: `jest --config ${jestConfig} --rootDir . --passWithNoTests`,
        lint: "eslint src --ext .ts,.tsx",
        "test-ci": "pnpm test --ci --runInBand",
        "test-watch": "pnpm test --watch -u",
        typecheck: "tsc --noEmit",
      },
    }

    Object.assign(pkg, patch)
    fs.writeFileSync(`${dir}/package.json`, JSON.stringify(pkg, null, 2))
  }
}
