import findPkgs from "find-packages"

export async function getWorkspacePackages() {
  return findPkgs(process.cwd(), {
    includeRoot: false,
    patterns: ["packages/**/*", "shared/*"],
  })
}

export async function getMachinePackages() {
  return findPkgs(process.cwd(), {
    patterns: ["packages/machines/**/*"],
  })
}

export async function getExamplePackages() {
  return findPkgs(process.cwd(), {
    patterns: ["examples/*"],
  })
}
