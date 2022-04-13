const camelCase = (str) => {
  return str.replace(/[-_]([a-z])/g, (g) => g[1].toUpperCase())
}

/**
 * @param {import("plop").NodePlopAPI} plop
 */
module.exports = function main(plop) {
  plop.setHelper("camelize", camelCase)

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
      const actions = []

      if (!answers) return actions

      const { machine } = answers

      actions.push({
        type: "addMany",
        templateFiles: "machine/**",
        destination: `../packages/machines/{{dashCase machine}}`,
        base: "machine/",
        data: { machine, packageName: machine },
        abortOnFail: true,
      })

      return actions
    },
  })

  plop.setGenerator("utility", {
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
      const actions = []

      if (!answers) return actions

      const { name, description } = answers

      actions.push({
        type: "addMany",
        templateFiles: "util-template/**",
        destination: `../packages/utilities/${name}`,
        base: "util-template/",
        data: {
          description,
          packageName: name,
        },
        abortOnFail: true,
      })

      return actions
    },
  })
}
