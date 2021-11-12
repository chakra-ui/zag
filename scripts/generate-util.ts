import nodePlop, { ActionType } from "node-plop"
import shell from "shelljs"

const plop = nodePlop("plop-templates/plopfile.hbs")

interface Answers {
  util: string
}

async function createUtil() {
  plop.setGenerator("util", {
    description: "Generates a new util package",
    prompts: [
      {
        type: "input",
        name: "util",
        message: "Enter util name (e.g. array, contains):",
      },
    ],
    actions(answers) {
      const actions: ActionType[] = []

      if (!answers) return actions

      const { util } = answers as Answers

      actions.push({
        type: "addMany",
        templateFiles: "util-template/**",
        destination: `../packages/utils/{{dashCase util}}`,
        base: "util-template/",
        data: { util, packageName: util },
        abortOnFail: true,
      })

      return actions
    },
  })

  const { runPrompts, runActions } = plop.getGenerator("util")

  const answers = await runPrompts()
  await runActions(answers)
}

async function run() {
  await createUtil()
  shell.exec("yarn")
}

run()
