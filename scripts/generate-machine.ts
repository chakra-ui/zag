import nodePlop, { ActionType } from "node-plop"
import shell from "shelljs"

const plop = nodePlop("plop-templates/plopfile.hbs")

interface Answers {
  machine: string
}

async function createMachine() {
  plop.setGenerator("machine", {
    description: "Generates a new ui machine",
    prompts: [
      {
        type: "input",
        name: "machine",
        message: "Enter machine name (e.g. menu, popover):",
      },
    ],
    actions(answers) {
      const actions: ActionType[] = []

      if (!answers) return actions

      const { machine } = answers as Answers

      actions.push({
        type: "addMany",
        templateFiles: "machine-template/**",
        destination: `../packages/machines/{{dashCase machine}}`,
        base: "machine-template/",
        data: { machine, packageName: machine },
        abortOnFail: true,
      })

      return actions
    },
  })

  const { runPrompts, runActions } = plop.getGenerator("machine")

  const answers = await runPrompts()
  await runActions(answers)
}

async function run() {
  await createMachine()
  shell.exec("yarn")
}

run()
