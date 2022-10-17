import { findPackages } from "find-packages"
import { writeFile } from "fs/promises"
import { join } from "path"

async function main() {
  const pkgs = await findPackages(process.cwd(), {
    includeRoot: false,
    patterns: ["packages/**/*"],
  })

  Promise.all(
    pkgs.map((pkg) => {
      const { dir, manifest } = pkg

      // @ts-ignore
      const { module, main, type, types, name, version, description, ...rest } = manifest

      const data = {
        name,
        version,
        description,
        main: "dist/index.js",
        module: "dist/index.mjs",
        types,
        ...rest,
      }

      return writeFile(join(dir, "package.json"), JSON.stringify(data, null, 2))
    }),
  )
}

main()
