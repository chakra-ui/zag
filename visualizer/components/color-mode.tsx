import { SunIcon } from "@/components/visualizer/controls/icons"

import { MoonIcon } from "@/components/visualizer/controls/icons"
import { useTheme } from "next-themes"

export function ColorMode() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      title="toggle theme"
      aria-label="toggle theme"
      className="theme-toggle"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <MoonIcon className="moon" />
      <SunIcon className="sun" />
    </button>
  )
}
