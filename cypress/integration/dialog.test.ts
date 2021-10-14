/* eslint-disable jest/expect-expect */
describe("dialog", () => {
  beforeEach(() => {
    cy.visit("/dialog")
    cy.injectAxe()
    cy.findByTestId("trigger-1").realClick()
  })

  it("should have no accessibility violation", () => {
    cy.checkA11y(".dialog__content")
  })

  it("should focus on close button when dialog is open", () => {
    cy.findByTestId("close-1").should("have.focus")
  })

  it("should trap focus within dialog", () => {
    cy.findByTestId("close-1").should("have.focus")
    cy.findByTestId("close-1").tab().tab().tab().tab()
    cy.findByTestId("close-1").should("have.focus")
  })

  it("should close modal on escape", () => {
    cy.focused().realType("{esc}")
    cy.findByTestId("trigger-1").should("have.focus")
  })

  // potentially flaky test
  it("should close modal on overlay click", () => {
    cy.findByTestId("overlay-1").click(400, 400, { force: true })
    cy.findByTestId("trigger-1").should("have.focus")
  })

  describe("Nested dialogs", () => {
    beforeEach(() => {
      cy.findByTestId("trigger-2").click()
    })
    it("should focus close button", () => {
      cy.findByTestId("close-2").should("have.focus")
    })

    it("should trap focus", () => {
      cy.findByTestId("close-2").tab().tab()
      cy.findByTestId("close-2").should("have.focus")
    })

    it("should focus on nested buttton on escape", () => {
      cy.findByTestId("close-2").realType("{esc}")
      cy.findByTestId("trigger-2").should("have.focus")
    })

    it("should close modal on overlay click", () => {
      cy.findByTestId("overlay-2").click(400, 400, { force: true })
      cy.findByTestId("trigger-2").should("have.focus")
    })

    it("should close parent modal from child", () => {
      cy.findByTestId("special-close").realClick()
      cy.findByTestId("overlay-2").should("not.exist")
      cy.findByTestId("overlay-1").should("not.exist")
      // This works in browsers but not in cypress for some reason
      //   cy.findByTestId("trigger-1").should("have.focus")
    })
  })
})
