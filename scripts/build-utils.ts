import { getPackages } from "@manypkg/get-packages"
import fs from "fs"
import path from "path"

type PkgNode = {
  name: string
  externalDependencies: Map<string, any>
  localDependencies: Map<string, any>
  localDependents: Map<string, PkgNode>
}

type PkgGraph = Map<string, PkgNode>

type Packages = Array<{ abs: string; dir: string; pkg: Record<string, any> }>

let packagesCache: Packages

export async function getWorkspacePkgs() {
  if (packagesCache) {
    return packagesCache
  }

  const { packages } = await getPackages("packages")
  const { PackageGraph } = require("@lerna/package-graph")

  const pkgs = packages
    .map((pkg) => {
      const rel = path.relative(process.cwd(), pkg.dir)
      return { abs: pkg.dir, dir: rel, pkg: pkg.packageJson }
    })
    .filter((pkg) => !pkg.dir.includes("examples"))

  const detailsMap = new Map([...pkgs].map((pkg) => [pkg.pkg.name, pkg]))

  const sortedPackages: PkgGraph = new PackageGraph(
    pkgs.map(({ pkg }) => pkg),
    "dependencies",
  )

  packagesCache = Array.from(sortedPackages.values())
    .sort((pkgA, pkgB) => {
      if (pkgA.localDependencies.has(pkgB.name)) return 1
      return -1
    })
    .map((pkg) => detailsMap.get(pkg.name)!)

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
