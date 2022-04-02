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

  function sharedTests() {
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
    it("should not select an item if it is a disabled key", () => {
      cy.get("@input-arrow").click()
      cy.findByTestId("CA").click().should("not.have.attr", "data-checked", "true")
    })
    it("should skip disabled key when navigating with arrow keys", () => {
      cy.get("@input").type("{downArrow}{downArrow}{downArrow}")
      cy.findByTestId("CA").click().should("not.have.attr", "aria-selected", "true")
    })
    it("should add value to textfield after selecting an option", () => {
      cy.get("@input-arrow").click()
      cy.findByTestId("NG").click()
      cy.get("@input").should("have.value", "Nigeria")
    })
    it("should select option after typing and navigating with arrow keys", () => {
      cy.get("@input").type("ni{downArrow}{downArrow}{downArrow}{enter}").should("have.value", "Nigeria")
    })
    it("stop interactions after typing and presing escape", () => {
      cy.get("@input").type("nig{esc}").should("be.focused")
      cy.get("@listbox").should("not.be.visible")
    })
    it("stop interactions after typing and presing tab", () => {
      cy.get("@input").type("nig").tab().should("be.focused")
      cy.get("@listbox").should("not.be.visible")
    })
    it("should not focus first item if there are items loaded", () => {
      cy.get("@input-arrow").click()
      cy.findByTestId("ZA").should("not.be.focused")
    })

    it("scroll to selected option, when selected with mouse, and combobox is closed and reopened", () => {
      cy.get("@input-arrow").click()
      cy.findByTestId("DZ").click()
      cy.get("@input-arrow").click()
      cy.findByTestId("DZ").should("be.visible")
    })

    describe("autoHighlight mode on", () => {
      beforeEach(() => {
        cy.findByTestId("autoHighlight").check()
      })
      it("should have autoHighlight mode enabled", () => {
        cy.findByTestId("autoHighlight").should("be.checked")
      })
      it("should highlight first item when menu is opened", () => {
        cy.get("@input-arrow").click()
        cy.findByTestId("ZA").should("have.attr", "aria-selected", "true")
      })
    })

    describe("autoHighlight mode off", () => {
      it("should have autoHighlight mode disabled", () => {
        cy.findByTestId("autoHighlight").should("not.be.checked")
      })
      it("should highlight first item when arrow down is pressed after opening menu", () => {
        cy.get("@input-arrow").click()
        cy.get("@input").type("{downArrow}")
        cy.findByTestId("ZA").should("have.attr", "aria-selected", "true")
      })
      it("should highlight last item when arrow up is pressed after opening menu", () => {
        cy.get("@input-arrow").click()
        cy.get("@input").type("{upArrow}")
        cy.findByTestId("TN").should("have.attr", "aria-selected", "true")
      })
    })

    describe("Disabled combobox", () => {
      beforeEach(() => {
        cy.findByTestId("disabled").check()
      })
      it("should have disabled mode enabled", () => {
        cy.findByTestId("disabled").should("be.checked")
      })
    })
  }

  // End sharedTests

  describe("basic combobox", () => {
    beforeEach(() => {
      cy.findByTestId("autoComplete").uncheck()
    })
    it("should have autoComplete mode disabled", () => {
      cy.findByTestId("autoComplete").should("not.be.checked")
    })
    it("should have the correct `autocomplete` aria attribute", () => {
      cy.get("@input").should("have.attr", "aria-autocomplete", "list")
    })
    sharedTests()
  })

  describe("autocomplete combobox", () => {
    it("should have autoComplete mode enabled", () => {
      cy.findByTestId("autoComplete").should("be.checked")
    })
    it("should have the correct `autocomplete` aria attribute", () => {
      cy.get("@input").should("have.attr", "aria-autocomplete", "both")
    })
    sharedTests()
  })
})
