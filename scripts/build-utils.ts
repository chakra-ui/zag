import { getPackages } from "@manypkg/get-packages"
import fs from "fs"
import path from "path"

type Packages = Array<{ abs: string; dir: string; pkg: Record<string, any> }>

let packagesCache: Packages

export async function getWorkspacePkgs() {
  if (packagesCache) return packagesCache
  const { packages } = await getPackages("packages")

  packagesCache = packages
    .map((pkg) => {
      const rel = path.relative(process.cwd(), pkg.dir)
      return { abs: pkg.dir, dir: rel, pkg: pkg.packageJson }
    })
    .filter((pkg) => !pkg.dir.includes("examples") && !pkg.dir.includes("website"))
    .sort((pkg) => {
      if (/(utilities|types|core)/.test(pkg.dir)) return -1
      if (/(frameworks)/.test(pkg.dir)) return 0
      return 1
    })
    .sort((a, b) => {
      return a.dir.includes("utilities/core") ? -1 : b.dir.includes("utilities/core") ? 1 : 0
    })

  return packagesCache
}

/* -----------------------------------------------------------------------------
 * Generate types for in dev mode. In prod, we use ultra for type generation, see the
   package.json script
 * -----------------------------------------------------------------------------*/

export function generateDevTypings(dir: string) {
  const distPath = path.join(dir, "dist")
  fs.writeFileSync(path.join(distPath, "index.d.ts"), 'export * from "../src"')
}

export function writePkgJson(dir: string, pkg: Record<string, any>) {
  fs.writeFileSync(`${dir}/package.json`, JSON.stringify(pkg, null, 2))
}
