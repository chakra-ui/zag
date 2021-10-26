/* eslint-disable jest/expect-expect */
describe("tags input", () => {
  beforeEach(() => {
    cy.visit("/tags-input")
    cy.injectAxe()
    cy.findByTestId("input").as("input")
  })

  it("should in the dom", () => {
    cy.get(".tags-input").should("be.visible")
  })

  it("should add new tag value", () => {
    cy.get("@input").type("Svelte{enter}")
    cy.findByTestId("svelte-tag").should("be.visible")
    cy.get("@input").should("be.empty").and("have.focus")
  })

  it("deletes tag with backspace when input value is empty", () => {
    cy.get("@input").type("Svelte{enter}")
    cy.get("@input").type("{backspace}")
    cy.findByTestId("svelte-tag").should("have.attr", "data-selected")
    cy.get("@input").type("{backspace}")
    cy.findByTestId("svelte-tag").should("not.exist")
    cy.get("@input").should("be.empty").and("have.focus")
  })

  it("should navigate tags with arrow keys", () => {
    cy.get("@input").type("Svelte{enter}")
    cy.get("@input").type("Solid{enter}")

    cy.get("@input").type("{leftarrow}")
    cy.findByTestId("solid-tag").should("have.attr", "data-selected")

    cy.get("@input").type("{leftarrow}{leftarrow}")
    cy.findByTestId("vue-tag").should("have.attr", "data-selected")

    cy.get("@input").type("{rightarrow}")
    cy.findByTestId("svelte-tag").should("have.attr", "data-selected")
  })

  it("should clear focused tag on blur", () => {
    cy.get("@input").type("Svelte{enter}")
    cy.get("@input").type("Solid{enter}")
    cy.get("@input").type("{leftarrow}")
    cy.get("@input").blur()
  })

  it("removes tag on close button click", () => {
    cy.get("@input").type("Svelte{enter}")
    cy.get("@input").type("Solid{enter}")
    cy.get("@input").type("{leftarrow}")

    cy.findByTestId("svelte-close-button").click()
    cy.findByTestId("svelte-tag").should("not.exist")
  })

  it("edit tag with enter key", () => {
    cy.get("@input").type("Svelte{enter}")
    cy.get("@input").type("Solid{enter}")
    cy.get("@input").type("{leftarrow}{leftarrow}{enter}")
    cy.findByTestId("svelte-input").should("have.value", "Svelte").type("Jenkins{enter}")
    // rename svelte tag to jenkins
    cy.findByTestId("svelte-tag").should("not.exist")
    cy.findByTestId("jenkins-tag").should("have.attr", "data-selected")
    cy.findByTestId("jenkins-input").should("not.be.visible")
    // input should be focused
    cy.get("@input").should("have.focus")
  })

  it("add tags from paste event", () => {
    cy.findByTestId("addOnPaste").check()
    cy.get("@input").paste("Github, Jenkins")
    cy.findByTestId("github-tag").should("be.visible")
    cy.findByTestId("jenkins-tag").should("be.visible")
  })

  it("autofocus input on load", () => {
    cy.findByTestId("autoFocus").check()
    cy.get("@input").should("have.focus")
  })

  it("clears highlighted tag on escape press", () => {
    cy.get("@input").type("Svelte{enter}")
    cy.get("@input").type("{leftarrow}")
    cy.get("@input").type("{esc}")
    cy.findByTestId("svelte-tag").should("not.have.attr", "data-selected")
  })
})
