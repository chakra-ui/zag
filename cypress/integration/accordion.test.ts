/* eslint-disable jest/expect-expect */
describe("accordion", () => {
  beforeEach(() => {
    cy.visit("/accordion")
    cy.injectAxe()

    cy.findByTestId("home:trigger").as("homeTrigger")
    cy.findByTestId("home:panel").as("homePanel")

    cy.findByTestId("about:trigger").as("aboutTrigger")
    cy.findByTestId("about:panel").as("aboutPanel")

    cy.findByTestId("contact:trigger").as("contactTrigger")
    cy.findByTestId("contact:panel").as("contactPanel")
  })

  it("should have no a11y violations", () => {
    cy.checkA11y(".root")
  })

  it("should render", () => {
    cy.get("@homeTrigger").click()
    cy.get("@homePanel").should("be.visible")
    cy.get("@aboutPanel").should("not.be.visible")
    cy.get("@contactPanel").should("not.be.visible")

    cy.get("@aboutTrigger").click()
    cy.get("@aboutPanel").should("be.visible")
    cy.get("@homePanel").should("not.be.visible")
    cy.get("@contactPanel").should("not.be.visible")

    cy.get("@aboutTrigger").type("{downarrow}")
    cy.get("@contactTrigger").should("have.focus")

    // press space or enter to open the panel
    cy.get("@contactTrigger").type("{enter}")
    cy.get("@contactPanel").should("be.visible")
    cy.get("@aboutPanel").should("not.be.visible")
    cy.get("@homePanel").should("not.be.visible")
  })

  it("keyboard navigation", () => {
    cy.get("@homeTrigger").focus().type("{downarrow}")
    cy.get("@aboutTrigger").should("have.focus")
    cy.get("@aboutTrigger").type("{downarrow}")
    cy.get("@contactTrigger").should("have.focus")
    cy.get("@contactTrigger").type("{downarrow}")
    cy.get("@homeTrigger").should("have.focus")
    cy.get("@homeTrigger").type("{uparrow}")
    cy.get("@contactTrigger").should("have.focus")
    cy.get("@contactTrigger").type("{uparrow}")
    cy.get("@aboutTrigger").should("have.focus")
    cy.get("@aboutTrigger").type("{home}")
    cy.get("@homeTrigger").should("have.focus")
    cy.get("@homeTrigger").type("{end}")
    cy.get("@contactTrigger").should("have.focus")
  })
})
