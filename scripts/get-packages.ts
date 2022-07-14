import { findWorkspacePackagesNoCheck } from "@pnpm/find-workspace-packages"

export async function getWorkspacePackages() {
  return findWorkspacePackagesNoCheck(process.cwd())
}

export async function getMachinePackages() {
  return findWorkspacePackagesNoCheck(process.cwd(), {
    patterns: ["packages/machines/**/*"],
  })
}
