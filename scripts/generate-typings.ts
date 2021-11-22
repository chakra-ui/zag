import { generateDevTypings, getWorkspacePkgs } from "./build-utils"

async function main() {
  const pkgs = await getWorkspacePkgs()
  pkgs.forEach((pkg) => {
    generateDevTypings(pkg.abs)
  })
}

main()
