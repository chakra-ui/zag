import { describe, expect, test } from "vitest"
import { filterProjects } from "./filter-projects"

const projects = [
  {
    name: "zag-ripple",
    description: "Component library for Ripple JS",
    author: "anubra266",
  },
  {
    name: "zagjs-lit",
    description: "Lit framework adapter",
    author: "RampantDespair",
  },
  {
    name: "zag-angular",
    description: "An Angular wrapper for zag",
    author: "makuko",
  },
]

describe("filterProjects", () => {
  test("an empty or blank query keeps every project", () => {
    expect(filterProjects(projects, "")).toEqual(projects)
    expect(filterProjects(projects, "   ")).toEqual(projects)
  })

  test("matches name, description and author, ignoring case", () => {
    expect(filterProjects(projects, "LIT").map((p) => p.name)).toEqual([
      "zagjs-lit",
    ])
    expect(
      filterProjects(projects, "angular wrapper").map((p) => p.name),
    ).toEqual(["zag-angular"])
    expect(filterProjects(projects, "anubra").map((p) => p.name)).toEqual([
      "zag-ripple",
    ])
  })

  test("no match returns an empty list", () => {
    expect(filterProjects(projects, "svelte")).toEqual([])
  })
})
