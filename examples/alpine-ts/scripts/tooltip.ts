import * as presence from "@zag-js/presence"
import * as tooltip from "@zag-js/tooltip"
import Alpine from "alpinejs"
import { usePlugin } from "../lib"

const products = [
  { id: 1, name: "Laptop", price: 999, stock: 15, description: "High-performance laptop with 16GB RAM and 512GB SSD" },
  { id: 2, name: "Mouse", price: 29, stock: 50, description: "Ergonomic wireless mouse with precision tracking" },
  { id: 3, name: "Keyboard", price: 79, stock: 30, description: "Mechanical keyboard with RGB backlight" },
  { id: 4, name: "Monitor", price: 299, stock: 20, description: "27-inch 4K display with HDR support" },
  { id: 5, name: "Webcam", price: 89, stock: 25, description: "1080p webcam with auto-focus and noise cancellation" },
]
Alpine.magic("products", () => products)

Alpine.plugin(usePlugin("presence", presence))
Alpine.plugin(usePlugin("tooltip", tooltip))
Alpine.start()
