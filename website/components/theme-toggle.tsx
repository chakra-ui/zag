import { Square, styled } from "styled-system/jsx"
import { useTheme } from "next-themes"
import { FaMoon, FaSun } from "react-icons/fa"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <Square size="8" bg="text.muted/20" animation="pulse" />

  const isDark = resolvedTheme === "dark"
  const text = isDark ? "light" : "dark"
  const SwitchIcon = isDark ? FaSun : FaMoon
  const toggleMode = () => setTheme(isDark ? "light" : "dark")

  return (
    <styled.button
      width="8"
      height="8"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="transparent"
      border="none"
      cursor="pointer"
      color="text.muted"
      _hover={{ color: "text" }}
      onClick={toggleMode}
      _icon={{ fill: "currentcolor" }}
    >
      <styled.span srOnly>{`Switch to ${text} mode`}</styled.span>
      <SwitchIcon size={16} />
    </styled.button>
  )
}
