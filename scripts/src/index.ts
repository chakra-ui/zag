import { Command } from "commander"
import { build } from "./commands"
import { logger } from "./utilities/log"

const program = new Command()

// prettier-ignore
program.name("zag-cli")
  .description("cli utilities for zag")

program
  .command("build")
  .description("Build a package")
  .option("-r, --report", "report bundle size")
  .option("-w, --watch", "watch for changes")
  .option("-p, --prod", "minify for production")
  .action(build)

program.parse(process.argv)

process.on("uncaughtException", (error) => {
  logger.error(error.message)
})
