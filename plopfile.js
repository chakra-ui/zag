const camelCase = (str) => {
  return str.replace(/[-_]([a-z])/g, (g) => g[1].toUpperCase())
}

const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const multiCapitalize = (str) => {
  return str.split("-").map(capitalize).join(" ")
}

/**
 * @param {import("plop").NodePlopAPI} plop
 */
module.exports = function main(plop) {
  plop.setHelper("camelize", camelCase)
  plop.setHelper("capitalize", capitalize)
  plop.setHelper("multiCapitalize", multiCapitalize)

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
        templateFiles: "plop/machine/**",
        destination: `packages/machines/{{dashCase machine}}`,
        base: "plop/machine/",
        data: { machine, name: machine },
        abortOnFail: true,
      })

      actions.push({
        type: "addMany",
        templateFiles: "plop/machine-examples/**",
        destination: `examples`,
        base: "plop/machine-examples/",
        data: { machine, name: machine },
        abortOnFail: true,
      })

      actions.push({
        type: "modify",
        path: "shared/src/routes.ts",
        pattern: /\= \[/,
        template: '= [\n  { label: "{{multiCapitalize machine}}", path: "/{{machine}}" },',
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
        templateFiles: "plop/utility/**",
        destination: `packages/utilities/{{dashCase name}}`,
        base: "plop/utility/",
        data: { description, name },
        abortOnFail: true,
      })

      return actions
    },
  })
}
