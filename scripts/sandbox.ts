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

      manifest.devDependencies ||= {}
      manifest.devDependencies["clean-package"] = "2.2.0"

      manifest.scripts = {
        ...manifest.scripts,
        prepack: "clean-package",
        postpack: "clean-package restore",
      }

      return writeFile(join(dir, "package.json"), JSON.stringify(manifest, null, 2))
    }),
  )
}

main()
