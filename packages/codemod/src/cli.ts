#!/usr/bin/env node
import { main } from "./main"

main(process.argv.slice(2)).then(
  (code) => {
    process.exitCode = code
  },
  (error) => {
    console.error(error)
    process.exitCode = 1
  },
)
