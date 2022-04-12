describe("popover", () => {
  beforeEach(() => {
    cy.visit("/popover")
    cy.injectAxe()

    cy.findByTestId("popover-trigger").as("trigger")
    cy.findByTestId("popover-content").as("content")
    cy.findByTestId("popover-title").as("title")
    cy.findByTestId("popover-body").as("body")
    cy.findByTestId("popover-close-button").as("close")

    cy.findByTestId("button-before").as("button-before")
    cy.findByTestId("input").as("input")
    cy.findByTestId("button-after").as("button-after")
    cy.findByTestId("focusable-link").as("link")
    cy.findByTestId("plain-text").as("text")
  })

  it("should have no accessibility violations", () => {
    cy.findByPart("root").then(cy.checkA11y)
  })

  describe("focus management", () => {
    it("should move focus inside the popover content to the first focusable element", () => {
      cy.get("@trigger").click()
      cy.get("@content").should("be.visible")
      cy.get("@link").should("be.focused")
    })
  })

  describe("keyboard interaction", () => {
    it("should open the Popover on press `Enter`", () => {
      cy.get("@trigger").type("{enter}")
      cy.get("@content").should("be.visible")
    })

    it("should close the Popover on press `Escape`", () => {
      cy.get("@trigger").type("{enter}")
      cy.get("@content").should("be.visible")
      cy.focused().type("{esc}")
      cy.get("@content").should("not.be.visible")
      cy.get("@trigger").should("have.focus")
    })

    describe("when in modal mode", () => {
      beforeEach(() => {
        cy.findByTestId("modal").check()
        cy.get("@trigger").type("{enter}")
      })

      it("on tab: should trap focus within popover content", () => {
        cy.get("@link").should("have.focus")
        cy.focused().realPress("Tab")
        cy.focused().realPress("Tab")
        cy.focused().realPress("Tab")
        cy.get("@link").should("have.focus")
      })
    })

    describe("when in non-modal mode", () => {
      beforeEach(() => {
        cy.get("@trigger").type("{enter}")
      })

      it("on tab outside: should move focus to next tabbable element after button", () => {
        cy.focused().realPress("Tab")
        cy.focused().realPress("Tab")
        cy.focused().realPress("Tab")
        cy.get("@button-after").should("have.focus")
      })

      it("on shift-tab outside: should move focus to trigger", () => {
        cy.focused().realPress(["Shift", "Tab"])
        cy.get("@trigger").should("have.focus")
        cy.get("@content").should("not.be.visible")
      })
    })

    it("escape closes the popover", () => {
      cy.get("@trigger").type("{enter}")
      cy.focused().type("{esc}")
      cy.get("@content").should("not.be.visible")
      cy.get("@trigger").should("have.focus")
    })

    it("close the popover on click close button", () => {
      cy.get("@trigger").type("{enter}")
      cy.get("@close").click()
      cy.get("@content").should("not.be.visible")
    })
  })

  describe("pointer interactions", () => {
    it("should to open/close a popover on trigger click", () => {
      cy.get("@trigger").click()
      cy.get("@content").should("be.visible")
      cy.get("@trigger").click()
      cy.get("@content").should("not.be.visible")
    })

    describe("when clicking outside", () => {
      it("should re-focus the button on click non-focusable element", () => {
        cy.get("@trigger").click()
        cy.get("@text").click()
        cy.get("@trigger").should("have.focus")
      })

      it("should not re-focus the button on click focusable element", () => {
        cy.get("@trigger").click()
        cy.get("@button-before").click().should("have.focus")
        cy.get("@trigger").should("not.have.focus")
      })
    })
  })
})
