/* eslint-disable jest/expect-expect */
describe("tooltip", () => {
  beforeEach(() => {
    cy.visit("/tooltip")
    cy.findByTestId("tip-1-trigger").as("trigger1")
    cy.findByTestId("tip-2-trigger").as("trigger2")
  })

  it("should open tooltip on hover interaction", () => {
    cy.get("@trigger1").realHover()
    cy.findByTestId("tip-1-tooltip").should("exist")
    cy.get("@trigger1").trigger("pointerout")
    cy.findByTestId("tip-1-tooltip").should("not.exist")
  })

  it("should show only one tooltip at a time", () => {
    cy.get("@trigger1").realHover()
    cy.findByTestId("tip-1-tooltip").should("exist")
    cy.get("@trigger2").realHover()
    cy.findByTestId("tip-1-tooltip", { timeout: 0 }).should("not.exist")
    cy.findByTestId("tip-2-tooltip", { timeout: 0 }).should("exist")
  })

  it("should work with focus/blur", () => {
    cy.get("@trigger1").focus()
    cy.findByTestId("tip-1-tooltip").should("exist")
    cy.get("@trigger1").blur()
    cy.findByTestId("tip-1-tooltip").should("not.exist")
  })

  it("should work with focus/blur for multiple tooltips", () => {
    cy.get("@trigger1").focus()
    cy.findByTestId("tip-1-tooltip").should("exist")

    cy.get("@trigger1").tab()
    cy.get("@trigger2").should("have.focus")
    cy.findByTestId("tip-1-tooltip").should("not.exist")
    cy.findByTestId("tip-2-tooltip").should("exist")
  })

  it("closes on mousedown", () => {
    cy.get("@trigger1").realHover()
    cy.findByTestId("tip-1-tooltip").should("exist")
    cy.get("@trigger1").trigger("pointerdown")
    cy.findByTestId("tip-1-tooltip").should("not.exist")
  })

  it("closes on esc press", () => {
    cy.get("@trigger1").realHover()
    cy.findByTestId("tip-1-tooltip").should("exist")
    cy.get("@trigger1").type("{esc}")
    cy.findByTestId("tip-1-tooltip").should("not.exist")
  })
})
