import "cypress-axe"

const COMMAND_DELAY = 500

for (const cmd of ["click", "trigger", "type", "tab", "realHover"]) {
  Cypress.Commands.overwrite(cmd, (fn, ...args) => {
    return fn(...args).then((val) => {
      return Cypress.Promise.resolve(val).delay(COMMAND_DELAY)
    })
  })
}

Cypress.Commands.add("paste", { prevSubject: true }, (subject, text = "") => {
  const clipboardData = new DataTransfer()
  clipboardData.setData("text/plain", text)
  const [el] = subject
  const pasteEvent = new ClipboardEvent("paste", {
    clipboardData,
    bubbles: true,
    cancelable: true,
  })
  el.focus()
  el.dispatchEvent(pasteEvent)
  return subject
})
