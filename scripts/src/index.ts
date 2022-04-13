import { Command } from "commander"
import build from "./commands/build"
import csb from "./commands/csb"
import modify from "./commands/modify"
import { createLogger } from "./utilities/log"

const program = new Command()
const logger = createLogger("cli")

// prettier-ignore
program.name("zag-cli")
  .description("CLI utilities for zag")

program
  .command("build")
  .description("Build a package")
  .option("-r, --report", "report bundle size")
  .option("-w, --watch", "watch for changes")
  .option("-p, --prod", "minify for production")
  .action(build)

// prettier-ignore
program
  .command("csb")
  .description("Patch .codesandbox json")
  .action(csb)

// prettier-ignore
program
  .command("modify")
  .description("Modify package.json for public packages")
  .action(modify)

program.parse(process.argv)

process.on("uncaughtException", (error) => {
  logger.error(error.message)
})
