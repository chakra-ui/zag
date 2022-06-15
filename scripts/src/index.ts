import { Command } from "commander"
import { patchTypes } from "./commands/patch-types"
import visualize from "./commands/visualize"
import { createLogger } from "./utilities/log"

const program = new Command()
const logger = createLogger("cli")

program.name("zag-cli").description("CLI utilities for zag")

program
  .command("visualize")
  .description("Visualize package")
  .argument("[component]", "component machine to visualize")
  .option("-o, --outDir <outDir>", "folder to store visualized machines")
  .option("--all", "visualize all components")
  .action(visualize)

program.command("types").description("Patch types in dev mode").action(patchTypes)

program.parse(process.argv)

process.on("uncaughtException", (error) => {
  logger.error(error)
})
