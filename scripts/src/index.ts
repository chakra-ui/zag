import { Command } from "commander"
import build from "./commands/build"
import csb from "./commands/csb"
import modify from "./commands/modify"
import visualize from "./commands/visualize"
import { createLogger } from "./utilities/log"

const program = new Command()
const logger = createLogger("cli")

// prettier-ignore
program.name("zag-cli")
  .description("CLI utilities for zag")

program
  .command("build")
  .description("Build a package")
  .option("-w, --watch", "watch for changes")
  .option("-p, --prod", "minify for production")
  .option("--clean", "clean dist folder")
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

// prettier-ignore
program
  .command("visualize")
  .description("Visualize package")
  .argument('[component]', 'component machine to visualize')
  .option("-o, --outDir <outDir>", "folder to store visualized machines")
  .option("--all", "visualize all components")
  .action(visualize)

program.parse(process.argv)

process.on("uncaughtException", (error) => {
  logger.error(error)
})
