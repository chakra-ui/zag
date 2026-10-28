import apiJson from "@zag-js/docs"
import { describe, expect, test } from "vitest"
import { groupProps, type PropMeta } from "./prop-groups"

const entries = (record: Record<string, PropMeta>) => Object.entries(record)
const names = (group?: { props: [string, PropMeta][] }) =>
  group?.props.map(([name]) => name) ?? []

const meta: PropMeta = { type: "boolean", description: "", defaultValue: null }

describe("groupProps", () => {
  test("menu: controlled props, events and advanced", () => {
    const groups = groupProps(
      entries(apiJson.menu.context as Record<string, PropMeta>),
    )
    const byLabel = Object.fromEntries(groups.map((g) => [g.label, g]))

    expect(names(byLabel.State)).toEqual(
      expect.arrayContaining([
        "open",
        "defaultOpen",
        "onOpenChange",
        "highlightedValue",
        "defaultHighlightedValue",
        "onHighlightChange",
      ]),
    )
    expect(names(byLabel.Events)).toContain("onSelect")
    expect(names(byLabel.Advanced)).toEqual(
      expect.arrayContaining(["id", "ids", "dir", "getRootNode"]),
    )
    expect(byLabel.Advanced.collapsed).toBe(true)
    expect(names(byLabel.Behavior)).toContain("closeOnSelect")
    expect(groups.map((g) => g.label)).toEqual([
      "State",
      "Behavior",
      "Events",
      "Advanced",
    ])
  })

  test("no controlled props means no State group", () => {
    const groups = groupProps([
      ["disabled", meta],
      ["onFocus", meta],
    ])
    expect(groups.map((g) => g.label)).toEqual(["Behavior", "Events"])
  })

  test("only callbacks gives only Events", () => {
    const groups = groupProps([
      ["onFocus", meta],
      ["onBlur", meta],
    ])
    expect(groups.map((g) => g.label)).toEqual(["Events"])
  })
})
