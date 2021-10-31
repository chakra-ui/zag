describe("accordion", () => {
  beforeEach(() => {
    cy.visit("/editable")
    cy.injectAxe()

    cy.findByTestId("input").as("input")
    cy.findByTestId("preview").as("preview")
  })

  describe("given that the preview is focusable", () => {
    it("should have no accessibility violations", () => {
      cy.checkA11y(".root")
    })

    describe("when in edit mode", () => {
      beforeEach(() => {
        cy.get("@preview").focus()
      })

      it("input should be visible", () => {
        cy.get("@input").should("be.visible").and("have.focus")
        cy.get("@preview").should("not.be.visible")
      })

      it("user can type and commit input value", () => {
        cy.get("@input").type("Hello World").should("have.value", "Hello World").type("{enter}")
        cy.get("@preview").should("have.text", "Hello World")
        cy.get("@input").should("not.be.visible")
      })

      it("user can type and revert value", () => {
        cy.get("@input").type("Hello{enter}")
        cy.get("@preview").should("have.text", "Hello").focus()
        cy.get("@input").type("Naruto{esc}")
        cy.get("@preview").should("have.text", "Hello")
        cy.get("@input").should("not.be.visible")
      })

      it("clicking submit: user can type and submit value", () => {
        cy.get("@input").type("Naruto")
        cy.findByTestId("save-button").click()
        cy.get("@preview").should("have.text", "Naruto")
      })

      it("blur the input: user can type and submit value", () => {
        cy.get("@input").type("Naruto")
        cy.get("@input").blur()
        cy.get("@preview").should("have.text", "Naruto")
      })
    })

    describe("when in preview mode", () => {
      it("clicking edit button should enter edit mode", () => {
        cy.findByTestId("edit-button").click()
        cy.get("@input").should("be.visible").and("have.focus")
      })
    })
  })
})
