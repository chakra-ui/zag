import fs from "fs"
import { gzipSync } from "zlib"

const prettyBytes = (bytes: number) => {
  if (bytes === 0) return "0 B"
  const unit = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
  const exp = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, exp)).toFixed(2)} ${unit[exp]}`
}

export const getBundleSize = (dir: string) => {
  return prettyBytes(gzipSync(fs.readFileSync(`${dir}/dist/index.mjs`)).length)
}
