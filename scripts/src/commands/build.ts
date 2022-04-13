import * as esbuild from "esbuild"
import fs from "fs"
import path from "path"
import { spawn } from "child_process"
import { createLogger } from "../utilities/log"
import { getBundleSize } from "../utilities/bundle-size"

function getPackageJson(dir: string) {
  const pkgPath = path.join(dir, "package.json")
  return JSON.parse(fs.readFileSync(pkgPath, "utf8")) as Record<string, any>
}

type BuildArgs = {
  report?: boolean
  watch?: boolean
  prod?: boolean
  clean?: boolean
}

const EXCLUDES = ["valtio"]

const logger = createLogger("build")

export default async function build(opts: BuildArgs) {
  const { report, watch, prod } = opts

  const cwd = process.cwd()
  const pkgJson = getPackageJson(cwd)

  const common: esbuild.BuildOptions = {
    target: "es6",
    minify: false,
    bundle: true,
    treeShaking: true,
    sourcemap: true,
    absWorkingDir: cwd,
    entryPoints: ["src/index.ts"],
    define: {
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    },
    external: EXCLUDES.concat(Object.keys(pkgJson.peerDependencies ?? {})),
    plugins: [
      {
        name: "resolve",
        setup(builder) {
          builder.onResolve({ filter: /^@zag-js/ }, (args) => {
            const root = args.resolveDir.split("packages")[0]
            const _path = path.resolve(path.join(root, "node_modules", args.path, "src", "index.ts"))
            return { path: _path }
          })
        },
      },
    ],
  }

  if (watch) {
    common.watch = {
      onRebuild(err) {
        if (err) {
          throw Error(`${err.name}: Rebuild failed`)
        }
        logger.buildComplete(pkgJson.name + " [cjs/esm]")
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

  logger.buildComplete(pkgJson.name + " [cjs/esm]")

  if (!prod) {
    const dist = path.join(cwd, "dist", "index.d.ts")
    fs.writeFileSync(dist, 'export * from "../src"')
  } else {
    spawn("tsc", [
      "src/index.ts",
      "--declaration",
      "--emitDeclarationOnly",
      "--declarationMap",
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

  if (report) {
    logger.info(getBundleSize(cwd, pkgJson.name))
  }
}
