import { styled } from "styled-system/jsx"
import { useTheme } from "next-themes"
import { FaMoon, FaSun } from "react-icons/fa"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const isDark = theme === "dark"
  const text = isDark ? "light" : "dark"
  const SwitchIcon = isDark ? FaSun : FaMoon
  const toggleMode = () => setTheme(isDark ? "light" : "dark")

  return (
    <styled.button
      width="6"
      height="6"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="transparent"
      border="none"
      cursor="pointer"
      color="gray.500"
      _hover={{ color: "gray.600" }}
      onClick={toggleMode}
    >
      <styled.span srOnly>{`Switch to ${text} mode`}</styled.span>
      <SwitchIcon size={16} />
    </styled.button>
  )
}
