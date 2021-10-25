import nodePlop, { ActionType } from "node-plop"
import shell from "shelljs"

const plop = nodePlop("plop-templates/plopfile.hbs")

interface Answers {
  name: string
  description: string
}

async function createPackage() {
  plop.setGenerator("util", {
    description: "Generates a utils package",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Enter package name:",
      },
      {
        type: "input",
        name: "description",
        message: "The description of this package:",
      },
    ],
    actions(answers) {
      const actions: ActionType[] = []

      if (!answers) return actions

      const { name, description } = answers as Answers

      actions.push({
        type: "addMany",
        templateFiles: "util-template/**",
        destination: `../packages/{{dashCase name}}`,
        base: "util-template/",
        data: { description, packageName: name },
        abortOnFail: true,
      })

      return actions
    },
  })

  const { runPrompts, runActions } = plop.getGenerator("util")

  const answers = await runPrompts()
  await runActions(answers)
}

async function main() {
  await createPackage()
  shell.exec("yarn")
}

main()
