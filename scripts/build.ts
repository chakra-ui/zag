import { getPackages } from "@manypkg/get-packages"
import chalk from "chalk"
import { BuildOptions, buildSync } from "esbuild"
import fs from "fs"
import gzipSize from "gzip-size"
import path from "path"
import pretty from "pretty-bytes"

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

export function setupDevDist(dir: string) {
  const distPath = path.join(dir, "dist")

  if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true, force: true })
  }

  fs.mkdirSync(distPath, { recursive: true })

  const files = ["index.js", "index.mjs", "index.d.ts"]
  files.forEach((file) => {
    fs.writeFileSync(path.join(distPath, file), 'export * from "../src"')
  })
}

export function reportSize(dir: string, name: string) {
  const output = [chalk.green(name), "gzip size", chalk.dim("→")]
  output.push(pretty(gzipSize.fileSync(`${dir}/dist/index.mjs`)))
  console.log(output.join(" "))
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
    entryPoints: ["src/index.ts"],
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

  reportSize(dir, pkg.name)
}

export function writePkgJson(dir: string, pkg: Record<string, any>) {
  fs.writeFileSync(`${dir}/package.json`, JSON.stringify(pkg, null, 2))
}

export async function main() {
  const dev = process.argv[2] === "--dev"

  const { packages } = await getPackages("packages")

  let pkgs = packages
    .map((t) => {
      const rel = path.relative(process.cwd(), t.dir)
      return { abs: t.dir, dir: rel, pkg: t.packageJson }
    })
    .filter((t) => !t.dir.includes("examples"))

  pkgs.forEach((t) => {
    if (dev) {
      setupDevDist(t.abs)
    } else {
      bundlePkg(t.abs, t.pkg)
    }
  })
}

main()
