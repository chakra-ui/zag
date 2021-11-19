import { getPackages } from "@manypkg/get-packages"
import { exec } from "child_process"
import { BuildOptions, buildSync } from "esbuild"
import fs from "fs"
import gzipSize from "gzip-size"
import path from "path"
import pretty from "pretty-bytes"

export function clean(dir: string) {
  exec(`rm -rf dist`, { cwd: dir })
}

export function getJestPath(dir: string) {
  const p = path.relative(dir, path.dirname("jest.config.js"))
  return path.join(p, "jest.config.js")
}

export function setupEntry(dir: string, pkg: Record<string, any>) {
  pkg.main = "dist/index.js"
  pkg.module = "dist/index.mjs"
  pkg.types = "dist/index.d.ts"
  delete pkg.scripts
  writePkgJson(dir, pkg)
}

export function reportSize(dir: string) {
  process.chdir(dir)
  console.log("Gzip size is:", pretty(gzipSize.fileSync("dist/index.mjs")))
}

export function bundlePkg(dir: string, pkg: Record<string, any>) {
  pkg.dependencies ||= {}
  pkg.peerDependencies ||= {}

  const common: BuildOptions = {
    minify: true,
    bundle: true,
    sourcemap: true,
    target: "es2020",
    absWorkingDir: dir,
    external: Object.keys(pkg.dependencies).concat(Object.keys(pkg.peerDependencies)),
  }

  buildSync({
    ...common,
    format: "cjs",
    outfile: "dist/index.js",
  })

  buildSync({
    ...common,
    format: "esm",
    outfile: "dist/index.mjs",
  })

  reportSize(dir)
}

export function writePkgJson(dir: string, pkg: Record<string, any>) {
  fs.writeFileSync(`${dir}/package.json`, JSON.stringify(pkg, null, 2))
}

export async function main() {
  const { packages } = await getPackages("packages")

  let pkgs = packages
    .map((t) => {
      const rel = path.relative(process.cwd(), t.dir)
      return { abs: t.dir, dir: rel, pkg: t.packageJson }
    })
    .filter((t) => t.dir.includes("core"))

  pkgs.forEach((t) => {
    bundlePkg(t.abs, t.pkg)
  })
}

main()
