import { describe, expect, test } from "vitest"
import { transformV2 } from "../src"

const run = (code: string, file = "file.tsx") => transformV2(code, file)
const out = (code: string, file?: string) => run(code, file).code
const messages = (code: string, file?: string) => run(code, file).notes.map((n) => n.message)

describe("selectors", () => {
  test("merges scope and part in CSS", () => {
    expect(out(`[data-scope="dialog"][data-part="trigger"] { color: red }`, "a.css")).toBe(
      `[data-dialog-trigger] { color: red }`,
    )
  })

  test("handles reversed order, single quotes, no quotes and extra attributes", () => {
    const css = [
      `[data-part='item'][data-scope='menu'] {}`,
      `[data-scope=accordion][data-part=item-trigger]:hover {}`,
      `[data-scope="menu"][data-part="item"][data-highlighted] {}`,
    ].join("\n")
    expect(out(css, "a.css")).toBe(
      [`[data-menu-item] {}`, `[data-accordion-item-trigger]:hover {}`, `[data-menu-item][data-highlighted] {}`].join(
        "\n",
      ),
    )
  })

  test("keeps the last letter of unquoted values ending in s or i", () => {
    expect(out(`[data-scope=tabs][data-part=trigger]:focus {}`, "a.css")).toBe(`[data-tabs-trigger]:focus {}`)
    expect(out(`[data-scope=steps][data-part=progress] {}`, "a.css")).toBe(`[data-steps-progress] {}`)
    expect(out(`[data-scope="menu"][data-part="item" i] {}`, "a.css")).toBe(`[data-menu-item] {}`)
  })

  test("keeps descendant combinators apart", () => {
    const css = `[data-scope="menu"] [data-part="item"] {}`
    const result = run(css, "a.css")
    expect(result.code).toBe(css)
    expect(result.notes).toHaveLength(2)
  })

  test("rewrites selectors inside JS strings, including escaped quotes", () => {
    expect(out(`document.querySelector('[data-scope="dialog"][data-part="content"]')`, "a.ts")).toBe(
      `document.querySelector('[data-dialog-content]')`,
    )
    expect(out(`page.locator("[data-scope=\\"menu\\"][data-part=\\"item\\"]")`, "a.ts")).toBe(
      `page.locator("[data-menu-item]")`,
    )
  })

  test("rewrites Tailwind variants", () => {
    expect(out(`<div className="data-[scope=menu]:data-[part=item]:bg-red-500" />`)).toBe(
      `<div className="data-[menu-item]:bg-red-500" />`,
    )
    expect(out(`<div class="data-[part=item]:data-[scope=menu]:p-2" />`, "a.html")).toBe(
      `<div class="data-[menu-item]:p-2" />`,
    )
  })

  test("renames parts that changed name", () => {
    expect(out(`[data-scope="pagination"][data-part="prev-trigger"] {}`, "a.css")).toBe(
      `[data-pagination-previous-trigger] {}`,
    )
    expect(
      out(
        [
          `[data-scope="tree-view"][data-part="branch-control"] {}`,
          `[data-scope="tree-view"][data-part="item"] {}`,
          `[data-scope="tree-view"][data-part="item-text"] {}`,
          `[data-scope="tree-view"][data-part="branch-content"] {}`,
        ].join("\n"),
        "a.css",
      ),
    ).toBe(
      [
        `[data-tree-view-node] {}`,
        `[data-tree-view-node] {}`,
        `[data-tree-view-node-text] {}`,
        `[data-tree-view-node-group-content] {}`,
      ].join("\n"),
    )
  })

  test("rewrites toggle state and indicator ssr attributes", () => {
    expect(
      out(
        [
          `[data-scope="toggle-group"][data-part="item"][data-state="on"] {}`,
          `[data-scope="toggle-group"][data-part="item"][data-state=off] {}`,
          `[data-scope="tabs"][data-part="trigger"][data-ssr] {}`,
        ].join("\n"),
        "a.css",
      ),
    ).toBe(
      [
        `[data-toggle-group-item][data-pressed] {}`,
        `[data-toggle-group-item]:not([data-pressed]) {}`,
        `[data-tabs-trigger][data-indicator-pending] {}`,
      ].join("\n"),
    )
  })

  test("renames handle position attributes", () => {
    expect(
      out(
        [
          `[data-scope="floating-panel"][data-part="resize-trigger"][data-axis="n"] {}`,
          `[data-scope="image-cropper"][data-part="handle"][data-position="nw"] {}`,
        ].join("\n"),
        "a.css",
      ),
    ).toBe(
      [
        `[data-floating-panel-resize-trigger][data-placement="n"] {}`,
        `[data-image-cropper-handle][data-placement="nw"] {}`,
      ].join("\n"),
    )
  })

  test("leaves unrelated data-state and array indexing alone", () => {
    const code = `const x = a[0][1]; const s = "[data-state=open]"`
    expect(out(code, "a.ts")).toBe(code)
  })

  test("flags a lone data-part", () => {
    expect(messages(`[data-part="item"] {}`, "a.css")[0]).toMatch(/no matching data-scope/)
  })

  test("renames --percent in steps styles", () => {
    expect(out(`[data-scope="steps"][data-part="progress"] { width: var(--percent) }`, "a.css")).toBe(
      `[data-steps-progress] { width: var(--steps-percent) }`,
    )
  })
})

describe("machine props", () => {
  test("renames carousel props in useMachine", () => {
    const code = `
import * as carousel from "@zag-js/carousel"
const service = useMachine(carousel.machine, { id: "1", slideCount: 5, autoplay: true, padding: "8px" })
`
    expect(out(code)).toContain(`{ id: "1", count: 5, autoPlay: true, itemSpacing: "8px" }`)
  })

  test("expands shorthand props when renaming", () => {
    const code = `
import * as carousel from "@zag-js/carousel"
const service = useMachine(carousel.machine, { slideCount })
`
    expect(out(code)).toContain(`{ count: slideCount }`)
  })

  test("follows Solid/Vue style getters and named machine imports", () => {
    const code = `
import { machine } from "@zag-js/pin-input"
const service = useMachine(machine, () => ({ id: "1", count: 4, sanitizeValue: (v) => v, selectOnFocus: true }))
`
    expect(out(code)).toContain(`({ id: "1", count: 4, normalizeValue: (v) => v })`)
  })

  test("rewrites composite and disableLayer", () => {
    const code = `
import * as combobox from "@zag-js/combobox"
import * as tabs from "@zag-js/tabs"
useMachine(combobox.machine, { open: true, disableLayer: true, composite: false })
useMachine(tabs.machine, { composite: false })
`
    const result = out(code)
    expect(result).toContain(`{ inline: true, popupType: "dialog" }`)
    expect(result).toContain(`useMachine(tabs.machine, { virtualFocus: true })`)
  })

  test("turns slider label arrays into functions", () => {
    const code = `
import * as slider from "@zag-js/slider"
useMachine(slider.machine, { "aria-label": ["Min", "Max"] })
`
    expect(out(code)).toContain(`{ getAriaLabel: ({ index }) => ["Min", "Max"][index] }`)
  })

  test("renames nested ids and translations", () => {
    const code = `
import * as pagination from "@zag-js/pagination"
useMachine(pagination.machine, { ids: { prevTrigger: "p" }, translations: { prevTriggerLabel: "Back" } })
`
    expect(out(code)).toContain(`{ ids: { previousTrigger: "p" }, translations: { previousTriggerLabel: "Back" } }`)
  })

  test("reports changed defaults without adding them", () => {
    const code = `
import * as accordion from "@zag-js/accordion"
const service = useMachine(accordion.machine, {
  id: "faq",
  loopFocus: true,
})
`
    const result = run(code)
    expect(result.code).not.toContain("collapsible")
    expect(result.notes.map((n) => n.message).join()).toContain("Pass `collapsible: false` to keep the v1 behavior")
  })

  test("does not add a default that is already set", () => {
    const code = `
import * as toc from "@zag-js/toc"
useMachine(toc.machine, { multiple: false })
`
    expect(out(code)).toContain(`{ multiple: false }`)
  })

  test("renames async-list load params, keeping local names", () => {
    const code = `
import * as asyncList from "@zag-js/async-list"
useMachine(asyncList.machine, {
  initialFilterText: "a",
  async load({ signal, filterText, sortDescriptor: sd }) {},
})
`
    const result = out(code)
    expect(result).toContain(`initialFilter: "a"`)
    expect(result).toContain(`load({ signal, filter: filterText, sorting: sd })`)
  })

  test("handles typed props objects", () => {
    const code = `
import * as carousel from "@zag-js/carousel"
const props: carousel.Props = { slideCount: 3 }
`
    expect(out(code)).toContain(`{ count: 3 }`)
  })
})

describe("api members", () => {
  test("renames distinctive members", () => {
    const code = `
import * as pagination from "@zag-js/pagination"
const api = pagination.connect(service, normalizeProps)
api.goToPrevPage()
const t = <button {...api.getPrevTriggerProps()} />
`
    const result = out(code)
    expect(result).toContain(`api.goToPreviousPage()`)
    expect(result).toContain(`api.getPreviousTriggerProps()`)
  })

  test("renames generic members only on the resolved api", () => {
    const code = `
import * as asyncList from "@zag-js/async-list"
const list = asyncList.connect(service)
const loading = query.loading
if (list.loading) list.sort({ column: "a" })
`
    const result = out(code)
    expect(result).toContain(`query.loading`)
    expect(result).toContain(`if (list.isLoading) list.setSorting({ column: "a" })`)
  })

  test("resolves Vue computed and Solid memo apis", () => {
    const vue = `
import * as listbox from "@zag-js/listbox"
const api = computed(() => listbox.connect(service, normalizeProps))
api.value.highlightValue("a")
`
    expect(out(vue, "a.ts")).toContain(`api.value.setHighlightedValue("a")`)

    const solid = `
import * as listbox from "@zag-js/listbox"
const api = createMemo(() => listbox.connect(service, normalizeProps))
api().highlightValue("a")
`
    expect(out(solid)).toContain(`api().setHighlightedValue("a")`)
  })

  test("turns clearHighlightValue into setHighlightedValue(null)", () => {
    const code = `
import * as select from "@zag-js/select"
const api = select.connect(service, normalizeProps)
api.clearHighlightValue()
`
    expect(out(code)).toContain(`api.setHighlightedValue(null)`)
  })

  test("migrates tree-view getters and indicator types", () => {
    const code = `
import * as tree from "@zag-js/tree-view"
function Node(props: { api: tree.Api; nodeProps: tree.NodeProps }) {
  const { api, nodeProps } = props
  return (
    <div {...api.getBranchProps(nodeProps)}>
      <div {...api.getBranchControlProps(nodeProps)}>
        <span {...api.getBranchIndicatorProps(nodeProps)} />
      </div>
      <div {...api.getItemProps(nodeProps)} />
      <span {...api.getItemIndicatorProps({ node })} />
    </div>
  )
}
`
    const result = run(code)
    expect(result.code).toContain(`api.getNodeGroupProps(nodeProps)`)
    expect(result.code).toContain(`api.getNodeProps(nodeProps)`)
    expect(result.code).toContain(`api.getNodeIndicatorProps({ ...nodeProps, type: "expanded" })`)
    expect(result.code).toContain(`api.getNodeIndicatorProps({ node, type: "selected" })`)
    expect(result.code).not.toContain("getItemProps")
    expect(result.notes.map((n) => n.message).join()).toMatch(/one node model/)
  })

  test("does not rename getItemProps when another machine is in the file", () => {
    const code = `
import * as tree from "@zag-js/tree-view"
import * as select from "@zag-js/select"
const selectApi = select.connect(s, normalizeProps)
selectApi.getItemProps({ item })
`
    expect(out(code)).toContain(`selectApi.getItemProps({ item })`)
  })

  test("leaves look-alike apis from other libraries alone", () => {
    const code = `
import useEmblaCarousel from "embla-carousel-react"
emblaApi.scrollPrev()
`
    expect(out(code)).toBe(code)
  })

  test("renames tour actions and hover-card states", () => {
    const tour = `
import * as tour from "@zag-js/tour"
const steps = [{ id: "a", actions: [{ label: "Back", action: "prev" }], effect({ actions }) { actions.prev() } }]
`
    const result = out(tour)
    expect(result).toContain(`action: "previous"`)
    expect(result).toContain(`actions.previous()`)

    const hover = `
import * as hoverCard from "@zag-js/hover-card"
service.state.matches("closing")
`
    expect(out(hover)).toContain(`matches("open.closing")`)
  })

  test("reports popover api.portalled without rewriting it", () => {
    const code = `
import * as popover from "@zag-js/popover"
const api = popover.connect(service, normalizeProps)
const Wrapper = api.portalled ? Portal : Fragment
const off = { disabled: !api.portalled }
`
    const result = run(code)
    expect(result.code).toBe(code)
    expect(result.notes.filter((n) => n.message.includes("portalled")).map((n) => n.line)).toEqual([4, 5])

    const vue = `<script setup lang="ts">
import * as popover from "@zag-js/popover"
</script>
<template><Teleport to="body" :disabled="!api.portalled"></Teleport></template>
`
    const vueResult = run(vue, "P.vue")
    expect(vueResult.code).toBe(vue)
    expect(vueResult.notes.filter((n) => n.message.includes("portalled")).map((n) => n.line)).toEqual([4])
  })

  test("flags removed members", () => {
    const code = `
import * as avatar from "@zag-js/avatar"
const api = avatar.connect(service, normalizeProps)
api.setSrc("a.png")
`
    expect(messages(code).join()).toMatch(/setSrc/)
  })
})

describe("found while migrating the v1 examples", () => {
  test("resolves the right api when two components share the name `api`", () => {
    const code = `
import * as carousel from "@zag-js/carousel"
import * as dialog from "@zag-js/dialog"
function A() {
  const api = carousel.connect(s, normalizeProps)
  return <button {...api.getPrevTriggerProps()} />
}
function B() {
  const api = dialog.connect(s, normalizeProps)
  return <div {...api.getContentProps()} />
}
`
    expect(out(code)).toContain(`api.getPreviousTriggerProps()`)
  })

  test("keeps generic renames ambiguous when one name holds several apis", () => {
    const code = `
import * as tree from "@zag-js/tree-view"
import * as select from "@zag-js/select"
function A() { const api = tree.connect(s, n); return api.getItemProps(p) }
function B() { const api = select.connect(s, n); return api.getItemProps(p) }
`
    const result = run(code)
    expect(result.code).toBe(code)
    expect(result.notes.some((n) => n.message.includes("getItemProps"))).toBe(true)
  })

  test("renames module exports", () => {
    const code = `
import * as floating from "@zag-js/floating-panel"
import { handles } from "@zag-js/image-cropper"
const axes: floating.ResizeTriggerAxis[] = floating.resizeTriggerAxes
handles.map((position) => position)
`
    const result = out(code)
    expect(result).toContain(`import { placements as handles } from "@zag-js/image-cropper"`)
    expect(result).toContain(`const axes: floating.HandlePosition[] = floating.resizeTriggerPlacements`)
  })

  test("follows async-list wrapped in a useAsyncList hook", () => {
    const code = `
const list = useAsyncList<Item>({
  async load({ signal, filterText }) {},
  sort({ items, descriptor }) {},
})
if (list.loading) list.setFilterText("a")
`
    const result = out(code)
    expect(result).toContain(`load({ signal, filter: filterText })`)
    expect(result).toContain(`sort({ items, sorting: descriptor })`)
    expect(result).toContain(`if (list.isLoading) list.setFilter("a")`)
  })

  test("maps number-input range props to allowOutOfRange", () => {
    const code = `
import * as numberInput from "@zag-js/number-input"
useMachine(numberInput.machine, { clampValueOnBlur: false, min: 0 })
useMachine(numberInput.machine, { allowOverflow: true, clampValueOnBlur: false })
useMachine(numberInput.machine, { allowOverflow: false, clampValueOnBlur: true })
`
    const result = out(code)
    expect(result).toContain(`{ allowOutOfRange: true, min: 0 }`)
    expect(result).toContain(`{ allowOutOfRange: true }`)
    expect(result).toContain(`useMachine(numberInput.machine, {  })`)
  })

  test("sees through a type assertion on the machine", () => {
    const code = `
import * as asyncList from "@zag-js/async-list"
useMachine(asyncList.machine as asyncList.Machine<Item, string>, { async load({ filterText }) {} })
`
    const result = run(code)
    expect(result.code).toContain(`load({ filter: filterText })`)
    expect(result.notes.some((n) => n.message.includes("four type parameters"))).toBe(true)
  })

  test("does not touch the v2 sorting descriptor on a second run", () => {
    const code = `
import * as asyncList from "@zag-js/async-list"
const list = asyncList.connect(service)
const busy = list.sorting
const dir = list.sorting?.direction
`
    const once = out(code)
    expect(once).toContain(`const busy = list.isSorting`)
    expect(once).toContain(`const dir = list.sorting?.direction`)
    expect(out(once)).toBe(once)
  })

  test("removes several trailing props cleanly", () => {
    const code = `
import * as numberInput from "@zag-js/number-input"
useMachine(numberInput.machine, { min: 0, allowOverflow: false, clampValueOnBlur: true })
`
    expect(out(code)).toContain(`useMachine(numberInput.machine, { min: 0 })`)
  })
})

describe("single-file components", () => {
  test("transforms Vue script, template and styles", () => {
    const vue = `<script setup lang="ts">
import * as pagination from "@zag-js/pagination"
const api = computed(() => pagination.connect(service, normalizeProps))
</script>

<template>
  <button v-bind="api.getPrevTriggerProps()" @click="api.goToPrevPage()">Prev</button>
</template>

<style>
[data-scope="pagination"][data-part="prev-trigger"] { color: red }
</style>
`
    const result = out(vue, "Pager.vue")
    expect(result).toContain(`v-bind="api.getPreviousTriggerProps()"`)
    expect(result).toContain(`@click="api.goToPreviousPage()"`)
    expect(result).toContain(`[data-pagination-previous-trigger] { color: red }`)
  })

  test("transforms Svelte templates for a tree-view-only file", () => {
    const svelte = `<script lang="ts">
  import * as tree from "@zag-js/tree-view"
  let { api, nodeProps }: { api: tree.Api; nodeProps: tree.NodeProps } = $props()
</script>

<div {...api.getItemProps(nodeProps)}></div>
`
    expect(out(svelte, "Node.svelte")).toContain(`{...api.getNodeProps(nodeProps)}`)
  })

  test("adds the indicator type to an inline object in templates", () => {
    const svelte = `<script lang="ts">
  import * as tree from "@zag-js/tree-view"
</script>
<span {...api.getBranchIndicatorProps({ indexPath, node })}></span>
`
    expect(out(svelte, "Node.svelte")).toContain(`api.getNodeIndicatorProps({ indexPath, node, type: "expanded" })`)
  })

  test("adds the indicator type in templates", () => {
    const vue = `<script setup lang="ts">
import * as tree from "@zag-js/tree-view"
</script>
<template><span v-bind="api.getBranchIndicatorProps(nodeProps)" /></template>
`
    expect(out(vue, "Node.vue")).toContain(`api.getNodeIndicatorProps({ ...nodeProps, type: "expanded" })`)
  })
})

test("is idempotent", () => {
  const code = `
import * as accordion from "@zag-js/accordion"
import * as pagination from "@zag-js/pagination"
const api = pagination.connect(service, normalizeProps)
useMachine(accordion.machine, { id: "a" })
api.goToPrevPage()
const s = '[data-scope="menu"][data-part="item"]'
`
  const once = out(code)
  expect(out(once)).toBe(once)
})
