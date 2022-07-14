import findPkgs from "find-packages"

export async function getWorkspacePackages() {
  return findPkgs(process.cwd())
}

export async function getMachinePackages() {
  return findPkgs(process.cwd(), {
    patterns: ["packages/machines/**/*"],
  })
}
