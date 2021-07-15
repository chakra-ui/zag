import nodePlop, { ActionType } from "node-plop"
import shell from "shelljs"
import _ from "lodash"

const plop = nodePlop("plop-templates/plopfile.hbs")

interface Answers {
  machine: string
}

async function createMachine() {
  plop.setHelper("capitalize", (text) => {
    return _.capitalize(_.camelCase(text))
  })

  plop.setGenerator("machine", {
    description: "Generates a new ui machine",
    prompts: [
      {
        type: "input",
        name: "machine",
        message: "Enter machine name (e.g. menu, popover):",
      },
    ],
    actions(answers: any) {
      const actions: ActionType[] = []

      if (!answers) return actions

      const { machine } = answers as Answers

      actions.push({
        type: "addMany",
        templateFiles: "machine-template/**",
        destination: `../packages/machines/src/{{dashCase machine}}`,
        base: "machine-template/",
        data: { machine },
        abortOnFail: true,
      })

      actions.push({
        type: "append",
        path: "../packages/machines/src/index.ts",
        pattern: `/* PLOP_INJECT_EXPORT */`,
        template: `export * from "./{{dashCase machine}}"`,
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
