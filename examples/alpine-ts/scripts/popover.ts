import * as popover from "@zag-js/popover"
import * as presence from "@zag-js/presence"
import { popoverControls } from "@zag-js/shared"
import Alpine from "alpinejs"
import { useControls, usePlugin } from "../lib"

const documents = [
  { id: 1, name: "Project Proposal.pdf", type: "PDF", size: "2.4 MB", modified: "2024-01-15" },
  { id: 2, name: "Budget 2024.xlsx", type: "Excel", size: "856 KB", modified: "2024-01-14" },
  { id: 3, name: "Meeting Notes.docx", type: "Word", size: "124 KB", modified: "2024-01-13" },
  { id: 4, name: "Design Mockups.fig", type: "Figma", size: "4.2 MB", modified: "2024-01-12" },
  { id: 5, name: "Code Review.md", type: "Markdown", size: "45 KB", modified: "2024-01-11" },
]
Alpine.magic("documents", () => documents)

Alpine.data("popover", useControls(popoverControls))
Alpine.plugin(usePlugin("popover", popover))
Alpine.plugin(usePlugin("presence", presence))
Alpine.start()
