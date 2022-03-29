/* eslint-disable jest/expect-expect */
describe("combobox", () => {
  beforeEach(() => {
    cy.visit("/combobox")
    cy.injectAxe()

    cy.findByTestId("input").as("input")
    cy.findByTestId("input-arrow").as("input-arrow")
    cy.findByTestId("combobox-listbox").as("listbox")

    it("should have no accessibility violations", () => {
      cy.checkA11y(".combobox")
    })
  })

  describe("basic combobox", () => {
    it("should open combobox and focus input when arrow is clicked`", () => {
      cy.get("@input-arrow").click()
      cy.get("@listbox").should("be.visible")
      cy.get("@input").should("be.focused")
    })
    it("should open combobox when letter is typed into input`", () => {
      cy.get("@input").type("{a}")
      cy.get("@listbox").should("be.visible")
    })
  })
  describe("autocomplete combobox", () => {})
})
