import { getPackages } from "@manypkg/get-packages"
import chalk from "chalk"
import { watch } from "chokidar"
import * as esbuild from "esbuild"
import fs from "fs"
import gzipSize from "gzip-size"
import path from "path"
import pretty from "pretty-bytes"
import shell from "shelljs"

type Packages = Array<{ abs: string; dir: string; pkg: Record<string, any> }>
type BuildOptions = {
  dev: boolean
}

function writePkgJson(dir: string, pkg: Record<string, any>) {
  fs.writeFileSync(`${dir}/package.json`, JSON.stringify(pkg, null, 2))
}

let packagesCache: Packages

async function getWorkspacePkgs() {
  if (packagesCache) return packagesCache
  const { packages } = await getPackages("packages")

  packagesCache = packages
    .map((pkg) => {
      const rel = path.relative(process.cwd(), pkg.dir)
      return { abs: pkg.dir, dir: rel, pkg: pkg.packageJson }
    })
    .filter((pkg) => !pkg.dir.includes("examples"))
    .sort((pkg) => {
      if (/(utilities|types|core)/.test(pkg.dir)) return -1
      if (/(frameworks)/.test(pkg.dir)) return 0
      return 1
    })
    .sort((a, b) => {
      return a.dir.includes("utilities/core") ? -1 : b.dir.includes("utilities/core") ? 1 : 0
    })

  return packagesCache
}

/* -----------------------------------------------------------------------------
 * The logger utlity
 * -----------------------------------------------------------------------------*/
const logger = {
  watching() {
    console.log(chalk.green("Watching packages..."))
  },
  buildComplete() {
    console.log("✅", chalk.cyanBright(`Build complete.`))
  },
  changed(file: string) {
    console.log(chalk.cyanBright(`${file} changed. rebuilding...`))
  },
  fileChangeBuilt(name: string) {
    console.log("✅", chalk.cyanBright(`${name} built.`))
  },
  typesGenerated() {
    console.log("✅", chalk.cyanBright(`Type generation complete...`))
  },
}

export function setupEntry(dir: string, pkg: Record<string, any>) {
  pkg.main = "dist/index.js"
  pkg.module = "dist/index.mjs"
  pkg.types = "dist/index.d.ts"
  delete pkg.scripts
  writePkgJson(dir, pkg)
}

/**
 * Reports the gzip size of a bundle
 */
export function reportBundleSize(dir: string, name: string) {
  const output = [chalk.green(name), "gzip size", chalk.dim("→")]
  output.push(pretty(gzipSize.fileSync(`${dir}/dist/index.mjs`)))
  console.log(output.join(" "))
}

/* -----------------------------------------------------------------------------
 * ESM and CJS build scripts (Powered by esbuild)
 * -----------------------------------------------------------------------------*/

function buildPackage(dir: string, pkg: Record<string, any>, opts: BuildOptions) {
  const { dev } = opts

  shell.rm("-rf", `${dir}/dist`)

  const common: esbuild.BuildOptions = {
    minify: true,
    bundle: true,
    sourcemap: true,
    target: "es2020",
    absWorkingDir: dir,
    entryPoints: ["src/index.ts"],
    external: Object.keys(pkg.dependencies ?? {}).concat(Object.keys(pkg.peerDependencies ?? {})),
  }

  esbuild.buildSync({
    ...common,
    format: "cjs",
    outfile: "dist/index.js",
  })

  esbuild.buildSync({
    ...common,
    format: "esm",
    outfile: "dist/index.mjs",
  })

  if (!dev) {
    reportBundleSize(dir, pkg.name)
  }
}

function buildPackages(pkgs: Packages, opts: BuildOptions) {
  const { dev } = opts
  const len = pkgs.length
  for (let i = 0; i < len; i++) {
    const { abs, pkg } = pkgs[i]
    buildPackage(abs, pkg, opts)

    if (dev) {
      generateDevTypings(abs)
    }
  }

  if (dev) {
    logger.typesGenerated()
  }

  logger.buildComplete()
}

async function watchPackages(opts: BuildOptions) {
  logger.watching()

  watch("packages/**/src/**/*.ts", { followSymlinks: true }).on("change", async (file) => {
    logger.changed(file)

    const buildAll = /(utilities|types)/.test(file)
    const pkgs = await getWorkspacePkgs()

    if (buildAll) {
      buildPackages(pkgs, opts)
      return
    }

    const found = pkgs.find((t) => file.startsWith(t.dir))
    if (!found) return

    const { abs, pkg } = found
    buildPackage(abs, pkg, opts)
    logger.fileChangeBuilt(pkg.name)
  })
}

/* -----------------------------------------------------------------------------
 * Generate types for in dev mode. In prod, we use ultra for type generation, see the
   package.json script
 * -----------------------------------------------------------------------------*/

export function generateDevTypings(dir: string) {
  const distPath = path.join(dir, "dist")
  fs.writeFileSync(path.join(distPath, "index.d.ts"), 'export * from "../src"')
}

/* -----------------------------------------------------------------------------
 * Main build script
 * -----------------------------------------------------------------------------*/

export async function main() {
  const args = process.argv.slice(2)
  const flags = args.filter((arg) => arg.startsWith("--"))

  const dev = flags.includes("--dev")
  const watch = flags.includes("--watch")

  const packages = await getWorkspacePkgs()

  buildPackages(packages, { dev })

  if (watch) {
    watchPackages({ dev })
  }
}

main()
