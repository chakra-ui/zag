import { findPackages } from "find-packages"

export async function getWorkspacePackages() {
  return findPackages(process.cwd(), {
    includeRoot: false,
    patterns: ["packages/**/*", "shared/*"],
  })
}

export async function getMachinePackages() {
  return findPackages(process.cwd(), {
    patterns: ["packages/machines/**/*"],
  })
}

export async function getExamplePackages() {
  return findPackages(process.cwd(), {
    patterns: ["examples/*"],
  })
}
