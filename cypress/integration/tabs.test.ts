/* eslint-disable jest/expect-expect */
describe("tabs", () => {
  beforeEach(() => {
    cy.visit("/tabs")
    cy.injectAxe()

    cy.findByTestId("nils-tab").as("nilsTab")
    cy.findByTestId("agnes-tab").as("agnesTab")
    cy.findByTestId("joke-tab").as("jokeTab")

    cy.findByTestId("nils-tab-panel").as("nilsPanel")
    cy.findByTestId("agnes-tab-panel").as("agnesPanel")
    cy.findByTestId("joke-tab-panel").as("jokePanel")
  })

  it("should have no accessibility violation", () => {
    cy.checkA11y("[data-part=root]")
  })

  describe("in automatic mode", () => {
    it("should select the correct tab on click", () => {
      cy.get("@nilsPanel").should("be.visible")
      cy.get("@agnesTab").click()
      cy.get("@agnesPanel").should("be.visible")
      cy.get("@jokeTab").click()
      cy.get("@jokePanel").should("be.visible")
    })

    it("on `ArrowRight`: should select & focus the next tab", () => {
      cy.get("@nilsTab").focus().realType("{rightarrow}")
      cy.get("@agnesTab").should("have.focus")
      cy.get("@agnesPanel").should("be.visible")
      cy.get("@agnesTab").realType("{rightarrow}")
      cy.get("@jokeTab").should("have.focus")
      cy.get("@jokePanel").should("be.visible")
      cy.get("@jokeTab").realType("{rightarrow}")
      // the keyboard navigation should circle back
      cy.get("@nilsTab").should("have.focus")
      cy.get("@nilsPanel").should("be.visible")
    })

    it("on `ArrowLeft`: should select & focus the previous tab", () => {
      cy.get("@nilsTab").focus().realType("{leftarrow}")
      cy.get("@jokeTab").should("have.focus")
      cy.get("@jokePanel").should("be.visible")
      cy.get("@jokeTab").realType("{leftarrow}")
      cy.get("@agnesTab").should("have.focus")
      cy.get("@agnesPanel").should("be.visible")
      cy.get("@agnesTab").realType("{leftarrow}")
      cy.get("@nilsTab").should("have.focus")
      cy.get("@nilsPanel").should("be.visible")
    })

    it("on `Home` should select first tab", () => {
      cy.get("@jokeTab").click().realType("{home}")
      cy.get("@nilsTab").should("have.focus")
      cy.get("@nilsPanel").should("be.visible")
    })

    it("on `End` should select last tab", () => {
      cy.get("@nilsTab").focus().realType("{end}")
      cy.get("@jokeTab").should("have.focus")
      cy.get("@jokePanel").should("be.visible")
    })
  })

  describe("in manual mode", () => {
    beforeEach(() => {
      cy.findByTestId("activationMode").select("manual")
    })

    it("should have no accessibility violation", () => {
      cy.checkA11y(".tabs")
    })

    it("on `ArrowRight`: should select & focus the next tab", () => {
      cy.get("@nilsTab").focus().realType("{rightarrow}")
      cy.get("@agnesTab").should("have.focus")
      cy.get("@agnesPanel").should("not.be.visible")
      cy.get("@agnesTab").realType("{enter}")
      cy.get("@agnesPanel").should("be.visible")
      cy.get("@agnesTab").realType("{rightarrow}")
      cy.get("@jokeTab").should("have.focus")
      cy.get("@jokePanel").should("not.be.visible")
      cy.get("@jokeTab").realType("{enter}")
      cy.get("@jokePanel").should("be.visible")
    })

    it("on `ArrowLeft`: should select & focus the previous tab", () => {
      cy.get("@nilsTab").focus().realType("{leftarrow}")
      cy.get("@jokeTab").should("have.focus")
      cy.get("@jokePanel").should("not.be.visible")
      cy.get("@jokeTab").realType("{enter}")
      cy.get("@jokePanel").should("be.visible")
      cy.get("@jokeTab").realType("{leftarrow}")
      cy.get("@agnesTab").should("have.focus")
      cy.get("@agnesPanel").should("not.be.visible")
      cy.get("@agnesTab").realType("{enter}")
      cy.get("@agnesPanel").should("be.visible")
    })

    it("on `Home`: should go to first tab", () => {
      cy.get("@agnesTab").click().realType("{home}")
      cy.get("@nilsTab").should("have.focus")
      cy.get("@nilsPanel").should("not.be.visible")
      cy.get("@nilsTab").realType("{enter}")
      cy.get("@nilsPanel").should("be.visible")
    })

    it("on `End`: should go to last tab", () => {
      cy.get("@nilsTab").click().realType("{end}")
      cy.get("@jokeTab").should("have.focus")
      cy.get("@jokePanel").should("not.be.visible")
      cy.get("@jokeTab").realType("{enter}")
      cy.get("@jokePanel").should("be.visible")
    })
  })
})
