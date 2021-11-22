import chalk from "chalk"
import { watch } from "chokidar"
import * as esbuild from "esbuild"
import gzipSize from "gzip-size"
import pretty from "pretty-bytes"
import { generateDevTypings, getWorkspacePkgs, writePkgJson } from "./build-utils"

type Packages = Array<{ abs: string; dir: string; pkg: Record<string, any> }>
type BuildOptions = {
  dev: boolean
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

  const common: esbuild.BuildOptions = {
    minify: true,
    bundle: true,
    sourcemap: true,
    target: "es6",
    absWorkingDir: dir,
    entryPoints: ["src/index.ts"],
    external: Object.keys(pkg.dependencies ?? {}).concat(Object.keys(pkg.peerDependencies ?? {})),
  }

  try {
    esbuild.buildSync({
      ...common,
      format: "cjs",
      outfile: "dist/index.js",
    })
  } catch (error) {
    // noop
  }

  try {
    esbuild.buildSync({
      ...common,
      format: "esm",
      outfile: "dist/index.mjs",
    })
  } catch (error) {
    // noop
  }

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
