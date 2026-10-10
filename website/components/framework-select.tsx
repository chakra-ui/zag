import { frameworks, type Framework } from "lib/framework-utils"
import { usePathname, useRouter } from "next/navigation"
import { createElement, useEffect, useState } from "react"
import { css } from "styled-system/css"
import { HStack, styled } from "styled-system/jsx"
import { useFramework } from "./framework"
import { Icon } from "./ui/icon"

// A real <select>, styled with `appearance: base-select` where the browser
// supports it, so the options can show the framework icons. Elsewhere it stays
// the native select.
const selectStyles = css({
  fontSize: "sm",
  fontWeight: "semibold",
  color: "text.primary.bold",
  "@supports (appearance: base-select)": {
    "&, &::picker(select)": { appearance: "base-select" },
    display: "inline-flex",
    alignItems: "center",
    gap: "2",
    px: "2.5",
    py: "1",
    rounded: "md",
    borderWidth: "1px",
    borderColor: "border.subtle",
    bg: "bg",
    cursor: "pointer",
    _hover: { borderColor: "border.bold" },
    _focusVisible: { outline: "2px solid", outlineColor: "green.500" },
    "& selectedcontent": {
      display: "inline-flex",
      alignItems: "center",
      gap: "2",
    },
    "&::picker(select)": {
      mt: "1",
      p: "1",
      rounded: "lg",
      borderWidth: "1px",
      borderColor: "border.subtle",
      bg: "bg.popover",
      boxShadow: "lg",
    },
    "& option": {
      display: "flex",
      alignItems: "center",
      gap: "2",
      px: "2.5",
      py: "1.5",
      rounded: "md",
      fontWeight: "medium",
      color: "text",
      cursor: "pointer",
    },
    "& option:hover, & option:focus-visible": {
      bg: "bg.muted",
      outline: "none",
    },
    "& option:checked": { color: "text.primary.bold", fontWeight: "semibold" },
    "& option::checkmark": { display: "none" },
  },
})

export function FrameworkSelect() {
  const { framework, setFramework } = useFramework()
  const router = useRouter()
  const asPath = usePathname()

  // The button and icons only render on the client: a browser without
  // customizable select support drops them from the server HTML while parsing,
  // which would break hydration.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <HStack>
      <styled.label
        fontWeight="medium"
        htmlFor="framework-select"
        fontSize="sm"
      >
        Framework:{" "}
      </styled.label>
      <select
        id="framework-select"
        className={selectStyles}
        value={framework}
        onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
          const newFramework = event.currentTarget.value as Framework
          setFramework?.(newFramework)
          if (asPath.includes(framework) && newFramework !== framework) {
            const url = asPath.replace(framework, newFramework)
            router.replace(url)
          }
        }}
      >
        {mounted && (
          <button type="button">{createElement("selectedcontent")}</button>
        )}
        {Object.entries(frameworks).map(([key, value]) => (
          <option key={key} value={key}>
            {mounted && <Icon as={value.icon} aria-hidden />}
            {value.label}
          </option>
        ))}
      </select>
    </HStack>
  )
}
