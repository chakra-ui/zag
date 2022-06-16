import { spawn } from "child_process"
import * as esbuild from "esbuild"
import fs from "fs"
import path from "path"
import { createLogger } from "../utilities/log"
import { getBundleSize } from "../utilities/report-size"

function getPackageJson(dir: string) {
  const pkgPath = path.join(dir, "package.json")
  return JSON.parse(fs.readFileSync(pkgPath, "utf8")) as Record<string, any>
}

type BuildArgs = {
  watch?: boolean
  prod?: boolean
  clean?: boolean
  cwd?: string
}

const logger = createLogger("build")

export default async function build(opts: BuildArgs) {
  const { watch, prod, cwd = process.cwd(), clean } = opts

  const pkgJson = getPackageJson(cwd)

  // clean the dist folder
  if (clean) {
    logger.info("Cleaning dist folder")
    fs.rmSync(path.join(cwd, "dist"), { recursive: true })
  }

  const common: esbuild.BuildOptions = {
    target: "es6",
    minify: false,
    bundle: true,
    absWorkingDir: cwd,
    platform: "browser",
    entryPoints: ["src/index.ts"],
    define: {
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    },
    external: Object.keys(pkgJson.dependencies ?? {})
      .concat(Object.keys(pkgJson.peerDependencies ?? {}))
      .filter((pkg) => !/(utils|types)$/.test(pkg)),
  }

  if (watch) {
    common.incremental = true
    common.watch = {
      onRebuild(err) {
        if (err) {
          throw Error(`${err.name}: Rebuild failed`)
        }
        logger.buildComplete(pkgJson.name + " [cjs/esm]", getBundleSize(cwd))
      },
    }
  }

  await Promise.all([
    esbuild.build({
      ...common,
      format: "cjs",
      outfile: "dist/index.js",
    }),
    esbuild.build({
      ...common,
      format: "esm",
      outfile: "dist/index.mjs",
    }),
  ])

  logger.buildComplete(pkgJson.name + " [cjs/esm]", getBundleSize(cwd))

  if (!prod) {
    const dist = path.join(cwd, "dist", "index.d.ts")
    await fs.promises.writeFile(dist, 'export * from "../src"')
  } else {
    spawn("tsc", [
      "src/index.ts",
      "--declaration",
      "--emitDeclarationOnly",
      "--skipLibCheck",
      "--target",
      "es2018",
      "--moduleResolution",
      "node",
      "--outDir",
      "dist",
    ])
  }

  logger.typesGenerated(pkgJson.name + " [d.ts]")
}
