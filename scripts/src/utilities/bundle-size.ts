import gzipSize from "gzip-size"
import pretty from "pretty-bytes"
import chalk from "chalk"

export function getBundleSize(dir: string, name: string) {
  const output = [chalk.green(name), "gzip size", chalk.dim("→")]
  output.push(pretty(gzipSize.fileSync(`${dir}/dist/index.mjs`)))
  return output.join(" ")
}
