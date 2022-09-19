import findPkgs from "find-packages"
import { writeFile } from "fs/promises"
import { join } from "path"

async function main() {
  const pkgs = await findPkgs(process.cwd(), {
    includeRoot: false,
    patterns: ["packages/**/*"],
  })

  Promise.all(
    pkgs.map((pkg) => {
      const { dir, manifest } = pkg

      delete manifest.module
      delete manifest.main

      const data = {
        type: "module",
        main: "dist/index.mjs",
        ...manifest,
      }

      return writeFile(join(dir, "package.json"), JSON.stringify(data, null, 2))
    }),
  )
}

main()
