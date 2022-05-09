import { getPackages, Package } from "@manypkg/get-packages"
import path from "path"

/* -----------------------------------------------------------------------------
 * Get all public packages in the current workspace
 * -----------------------------------------------------------------------------*/

function getPublicPackages(modules: Package[]): Packages {
  const cwd = process.cwd()
  return modules
    .map((module) => ({
      abs: module.dir,
      dir: path.relative(cwd, module.dir),
      pkg: module.packageJson,
    }))
    .filter(({ pkg }) => !pkg.private)
}

/* -----------------------------------------------------------------------------
 * Toposort packages by dependencies
 * -----------------------------------------------------------------------------*/

function toposort(modules: Packages) {
  const { PackageGraph } = require("@lerna/package-graph")
  const lookup = new Map(modules.map((module) => [module.pkg.name, module]))

  const graph: PkgGraph = new PackageGraph(
    modules.map((module) => module.pkg),
    "dependencies",
  )

  return Array.from(graph.values())
    .sort((pkgA, pkgB) => (pkgA.localDependencies.has(pkgB.name) ? 1 : -1))
    .map((pkg) => lookup.get(pkg.name)!)
}

type PackageGraphNode = {
  name: string
  externalDependencies: Map<string, any>
  localDependencies: Map<string, any>
  localDependents: Map<string, PackageGraphNode>
}

type PkgGraph = Map<string, PackageGraphNode>

type Packages = Array<{
  abs: string
  dir: string
  pkg: Record<string, any>
}>

/* -----------------------------------------------------------------------------
 * Get the workspace packages, sorted by dependencies
 * -----------------------------------------------------------------------------*/

export async function getWorkspacePackages() {
  const { packages } = await getPackages("packages")
  const pkgs = getPublicPackages(packages)
  return toposort(pkgs)
}

export async function getMachinePackages() {
  const workspacePackages = await getWorkspacePackages()
  const machinePkgs = workspacePackages.filter(({ dir }) => dir.indexOf("machines/") !== -1)
  return machinePkgs
}
