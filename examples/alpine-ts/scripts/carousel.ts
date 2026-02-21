import * as carousel from "@zag-js/carousel"
import Alpine from "alpinejs"
import { usePlugin } from "~/lib"

// Sample data with variable width content (content-driven sizing)
const variableWidthData = [
  { content: "Short", color: "#ff6b6b", type: "text" },
  {
    content: "This is a much longer slide with significantly more content that will naturally take up more space",
    color: "#4ecdc4",
    type: "text",
  },
  { content: "Hi", color: "#45b7d1", type: "text" },
  { content: "Medium length slide content here", color: "#96ceb4", type: "text" },
  { content: "⭐ Star Rating Widget ⭐⭐⭐⭐⭐", color: "#ffeaa7", type: "widget" },
  { content: "X", color: "#dda0dd", type: "text" },
  { content: "🔥 Popular Item with Badge 🔥", color: "#98d8c8", type: "badge" },
  { content: "A", color: "#e74c3c", type: "text" },
  { content: "📊 Analytics Dashboard Component 📈📉", color: "#9b59b6", type: "component" },
]

Alpine.magic("variableWidthData", () => variableWidthData)
Alpine.plugin(usePlugin("carousel", carousel))
Alpine.start()
