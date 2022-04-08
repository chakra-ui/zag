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

Cypress.Commands.add("clickOutside", () => {
  return cy.get("body").click(0, 0)
})

Cypress.Commands.add("findByPart", (label) => {
  return cy.get(`[data-part=${label}]`)
})

Cypress.Commands.add("realInput", { prevSubject: "element" }, (subject, value, options = {}) => {
  const { overwrite = true, prepend = false, inputType = "insertFromPaste" } = options
  const element = subject[0]
  const win = element.ownerDocument.defaultView ?? window

  const inputEvent = new win.InputEvent("input", { bubbles: true, inputType })

  let textValue = value

  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(win.HTMLInputElement.prototype, "value")?.set
  const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(win.HTMLTextAreaElement.prototype, "value")?.set

  if (!overwrite) {
    textValue = prepend ? `${value}${element.value}` : `${element.value}${value}`
  }
  const nativeSetter = element.localName === "input" ? nativeInputValueSetter : nativeTextAreaValueSetter
  nativeSetter?.call(element, textValue)
  element.focus()
  element.dispatchEvent(inputEvent)

  Cypress.log({
    name: "fill",
    message: value,
    $el: subject,
    consoleProps: () => {
      return {
        value,
        options,
      }
    },
  })

  cy.wrap(element)
})
