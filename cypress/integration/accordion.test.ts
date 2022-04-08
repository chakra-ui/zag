/* eslint-disable jest/expect-expect */
describe("accordion", () => {
  beforeEach(() => {
    cy.visit("/accordion")
    cy.injectAxe()

    cy.findByTestId("home:trigger").as("homeTrigger")
    cy.findByTestId("home:content").as("homeContent")

    cy.findByTestId("about:trigger").as("aboutTrigger")
    cy.findByTestId("about:content").as("aboutContent")

    cy.findByTestId("contact:trigger").as("contactTrigger")
    cy.findByTestId("contact:content").as("contactContent")
  })

  describe("given a single accordion", () => {
    it("should have no accessibility violation", () => {
      cy.checkA11y("[data-part=root]")
    })

    describe("when navigating by keyboard", () => {
      beforeEach(() => {
        cy.get("@homeTrigger").focus()
      })

      it("on `ArrowDown`: should move focus to the next trigger", () => {
        cy.focused().type("{downarrow}")
        cy.get("@aboutTrigger").should("have.focus")
      })

      it("on `ArrowUp`: should move focus to the previous trigger", () => {
        cy.focused().type("{downarrow}{uparrow}")
        cy.get("@homeTrigger").should("have.focus")
      })

      it("on `Home`: should move focus to the first trigger", () => {
        cy.focused().type("{downarrow}{downarrow}{home}")
        cy.get("@homeTrigger").should("have.focus")
      })

      it("on `End`: should move focus to the last trigger", () => {
        cy.focused().type("{end}")
        cy.get("@contactTrigger").should("have.focus")
      })
    })

    describe("when clicking a trigger", () => {
      beforeEach(() => {
        cy.get("@homeTrigger").click()
      })
      it("should show content", () => {
        cy.get("@homeContent").should("be.visible")
      })

      it("should have no accessibility violations", () => {
        cy.checkA11y(".accordion")
      })

      it("then clicking the same trigger again: should not close the content", () => {
        cy.get("@homeContent").should("be.visible")
      })

      it("then clicking another trigger: should close the previous content", () => {
        cy.get("@aboutTrigger").click()
        cy.get("@homeContent").should("not.be.visible")
      })

      it("then clicking another trigger: should show the new content", () => {
        cy.get("@aboutTrigger").click()
        cy.get("@aboutContent").should("be.visible")
      })
    })
  })

  describe("given a multiple accordion", () => {
    beforeEach(() => {
      // enable the `multiple` prop
      cy.findByTestId("multiple").check()
    })

    it("should have no accessibility violations", () => {
      cy.checkA11y(".accordion")
    })

    describe("when navigating by keyboard", () => {
      beforeEach(() => {
        cy.get("@homeTrigger").focus()
      })

      it("on `ArrowDown`: should move focus to the next trigger", () => {
        cy.focused().type("{downarrow}")
        cy.get("@aboutTrigger").should("have.focus")
      })

      it("on `ArrowUp`: should move focus to the previous trigger", () => {
        cy.focused().type("{downarrow}{uparrow}")
        cy.get("@homeTrigger").should("have.focus")
      })

      it("on `Home`: should move focus to the first trigger", () => {
        cy.focused().type("{downarrow}{downarrow}{home}")
        cy.get("@homeTrigger").should("have.focus")
      })

      it("on `End`: should move focus to the last trigger", () => {
        cy.focused().type("{end}")
        cy.get("@contactTrigger").should("have.focus")
      })
    })

    describe("when clicking a trigger", () => {
      beforeEach(() => {
        cy.get("@homeTrigger").click()
      })

      it("should show content", () => {
        cy.get("@homeContent").should("be.visible")
      })

      it("should have no accessibility violations", () => {
        cy.checkA11y(".accordion")
      })

      it("then clicking the same trigger again: should hide the content", () => {
        cy.get("@homeTrigger").click()
        cy.get("@homeContent").should("not.be.visible")
      })

      it("then clicking another trigger: should not close the previous content", () => {
        cy.get("@aboutTrigger").click()
        cy.get("@aboutContent").should("be.visible")
        cy.get("@homeContent").should("be.visible")
      })
    })
  })
})
