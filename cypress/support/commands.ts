import "cypress-axe"

const COMMAND_DELAY = 500

for (const cmd of ["click", "trigger", "type"]) {
  Cypress.Commands.overwrite(cmd, (fn, ...args) => {
    return fn(...args).then((val) => {
      return Cypress.Promise.resolve(val).delay(COMMAND_DELAY)
    })
  })
}
