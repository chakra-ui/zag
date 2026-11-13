#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"
import { createRequire } from "module"

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

// Read package.json to get all @zag-js dependencies
const packageJsonPath = resolve(__dirname, "package.json")
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"))

// Get all @zag-js packages from dependencies
const zagPackages = Object.keys(packageJson.dependencies).filter((pkg) => pkg.startsWith("@zag-js/"))

const packageMap = {}

for (const pkg of zagPackages) {
  try {
    // Get the package.json location and extract base path
    const packageJsonPath = require.resolve(pkg)
    const srcPath = dirname(packageJsonPath)
    // Convert to relative path from examples/svelte-ts
    const relativePath = srcPath.replace(resolve(__dirname, "../.."), "../..")
    packageMap[pkg] = relativePath
  } catch (error) {
    console.error(`❌ Failed to resolve ${pkg}:`, error.message)
  }
}

// Match the repo formatter (trailing newline) and skip unchanged writes, so runs leave no diff
const outputPath = resolve(__dirname, "package-map.json")
const output = JSON.stringify(packageMap, null, 2) + "\n"
const current = existsSync(outputPath) ? readFileSync(outputPath, "utf8") : ""
if (current !== output) writeFileSync(outputPath, output)
