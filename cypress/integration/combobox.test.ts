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

  describe("basic combobox", () => {})

  describe("autocomplete combobox", () => {
    it("should have the correct `autocomplete` aria attribute", () => {
      cy.get("@input").should("have.attr", "aria-autocomplete", "both")
    })
    it("should open combobox menu when arrow is clicked", () => {
      cy.get("@input-arrow").click()
      cy.get("@listbox").should("be.visible")
    })
    it("should keep focus within the textfield after opening the menu through arrow click", () => {
      cy.get("@input-arrow").click()
      cy.get("@input").should("be.focused")
    })
    it("should open combobox menu when letter is typed into input", () => {
      cy.get("@input").type("{a}")
      cy.get("@listbox").should("be.visible")
    })
    it("should open combobox menu when arrow down is pressed in input", () => {
      cy.get("@input").type("{downArrow}")
      cy.get("@listbox").should("be.visible")
    })
    it("should open combobox menu when arrow up is pressed in input", () => {
      cy.get("@input").type("{upArrow}")
      cy.get("@listbox").should("be.visible")
    })
    it("should not focus first item if there are items loaded", () => {
      cy.get("@input-arrow").click()
      cy.findByTestId("ZA").should("not.be.focused")
    })
    it("should focus first item when arrow down is pressed after opening menu", () => {
      cy.get("@input-arrow").click()
      cy.get("@input").type("{downArrow}")
      cy.findByTestId("ZA").should("have.attr", "aria-selected", "true")
    })
    it("should not select an item if it is a disabled key", () => {
      cy.get("@input-arrow").click()
      cy.findByTestId("CA").click().should("not.have.attr", "data-checked", "true")
    })
  })
})
