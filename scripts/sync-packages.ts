import { promises as fs } from "fs"
import { getExamplePackages, getWorkspacePackages } from "./get-packages"

function sortObject(obj: Record<string, any>) {
  return Object.keys(obj)
    .sort()
    .reduce((acc, key) => {
      acc[key] = obj[key]
      return acc
    }, {} as Record<string, any>)
}

async function main() {
  const pkgs = await getWorkspacePackages()
  const pkgsWithoutFrameworks = pkgs.filter((pkg) => !pkg.dir.includes("frameworks")).map((pkg) => pkg.manifest.name)
  const workspaceDeps = pkgsWithoutFrameworks.reduce((deps, name) => {
    deps[name!] = "workspace:*"
    return deps
  }, {} as any)

  const examples = await getExamplePackages()
  await Promise.all(
    examples.map(({ manifest, dir }) => {
      const newManifest = {
        ...manifest,
        dependencies: sortObject({
          ...manifest.dependencies,
          ...workspaceDeps,
        }),
      }
      return fs.writeFile(`${dir}/package.json`, JSON.stringify(newManifest, null, 2))
    }),
  )
}

main()
