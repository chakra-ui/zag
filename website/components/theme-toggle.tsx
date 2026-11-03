import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { FaMoon, FaSun } from "react-icons/fa"
import { css } from "styled-system/css"

const fallback = css({
  w: "8",
  h: "8",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  bg: "transparent",
  color: "text.muted",
  cursor: "pointer",
  _hover: { color: "text.bold" },
  _focusVisible: {
    outline: "2px solid",
    outlineColor: "border.primary.bold",
  },
  "& svg": { boxSize: "4", fill: "currentcolor" },
})

export function ThemeToggle(props: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === "dark"
  const label = mounted
    ? `Switch to ${isDark ? "light" : "dark"} mode`
    : "Toggle color mode"
  const SwitchIcon = isDark ? FaSun : FaMoon

  return (
    <button
      type="button"
      className={props.className ?? fallback}
      aria-label={label}
      title={label}
      disabled={!mounted}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {mounted ? (
        <SwitchIcon aria-hidden />
      ) : (
        <span
          aria-hidden
          className={css({
            boxSize: "3.5",
            rounded: "full",
            bg: "text.muted/20",
          })}
        />
      )}
    </button>
  )
}
