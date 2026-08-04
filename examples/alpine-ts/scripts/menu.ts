import * as menu from "@zag-js/menu"
import * as presence from "@zag-js/presence"
import { menuControls, menuData, menuOptionData } from "@zag-js/shared"
import Alpine from "alpinejs"
import { useControls } from "./use-controls"
import { usePlugin } from "../lib"

const [level1, level2, level3] = menuData
Alpine.magic("level1", () => level1)
Alpine.magic("level2", () => level2)
Alpine.magic("level3", () => level3)

Alpine.data("radios", () => ({
  order: "",
  get radios() {
    return menuOptionData.order.map((item) => ({
      type: "radio" as const,
      name: "order",
      value: item.value,
      label: item.label,
      checked: this.order === item.value,
      onCheckedChange: (checked: boolean) => {
        this.order = checked ? item.value : ""
      },
    }))
  },
}))
Alpine.data("checkboxes", () => ({
  type: [] as string[],
  get checkboxes() {
    return menuOptionData.type.map((item) => ({
      type: "checkbox" as const,
      name: "type",
      value: item.value,
      label: item.label,
      checked: this.type.includes(item.value),
      onCheckedChange: (checked: boolean) => {
        this.type = checked ? [...this.type, item.value] : this.type.filter((x) => x !== item.value)
      },
    }))
  },
}))

const files = [
  { id: 1, name: "Documents", type: "folder", icon: "📁" },
  { id: 2, name: "Photos", type: "folder", icon: "📁" },
  { id: 3, name: "report.pdf", type: "file", icon: "📄" },
  { id: 4, name: "presentation.pptx", type: "file", icon: "📊" },
  { id: 5, name: "notes.txt", type: "file", icon: "📝" },
  { id: 6, name: "Downloads", type: "folder", icon: "📁" },
]
Alpine.magic("files", () => files)

const documents = [
  { id: 1, name: "Project Proposal.pdf", type: "PDF", size: "2.4 MB", modified: "2024-01-15" },
  { id: 2, name: "Budget 2024.xlsx", type: "Excel", size: "856 KB", modified: "2024-01-14" },
  { id: 3, name: "Meeting Notes.docx", type: "Word", size: "124 KB", modified: "2024-01-13" },
  { id: 4, name: "Design Mockups.fig", type: "Figma", size: "4.2 MB", modified: "2024-01-12" },
  { id: 5, name: "Code Review.md", type: "Markdown", size: "45 KB", modified: "2024-01-11" },
]
Alpine.magic("documents", () => documents)

Alpine.plugin(usePlugin("presence", presence))
Alpine.data("menu", useControls(menuControls))
Alpine.plugin(usePlugin("menu", menu))
Alpine.start()
