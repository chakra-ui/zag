import { styled } from "styled-system/jsx"
import { HiOutlineSearch } from "react-icons/hi"
import { forwardRef, useEffect, useState } from "react"
import { Icon } from "components/ui/icon"
import { formatHotkey } from "@zag-js/hotkeys"
import { prefetchSearchIndex, SEARCH_HOTKEY } from "lib/use-search"

export const SearchTrigger = forwardRef<HTMLButtonElement, any>(
  function SearchTrigger(props, ref) {
    // the server can't know the platform, so the label is filled in after mount
    const [shortcut, setShortcut] = useState("")
    useEffect(() => {
      setShortcut(formatHotkey(SEARCH_HOTKEY, { platform: "auto" }))
    }, [])
    return (
      <styled.button
        {...props}
        ref={ref}
        type="button"
        aria-label="Search the docs"
        aria-keyshortcuts={shortcut.startsWith("⌘") ? "Meta+K" : "Control+K"}
        onPointerEnter={prefetchSearchIndex}
        onFocus={prefetchSearchIndex}
        width="full"
        display="flex"
        alignItems="center"
        justifyContent={{ base: "center", md: "flex-start" }}
        gap="2"
        bg="ink/5"
        fontSize="13px"
        h="34px"
        minW="9"
        px={{ base: "0", md: "3" }}
        pe={{ md: "1.5" }}
        color="ink.muted"
        cursor="pointer"
        rounded="full"
        transition="background 120ms, color 120ms"
        _hover={{ bg: "ink/8", color: "ink" }}
        _focusVisible={{
          outline: "2px solid",
          outlineColor: "border.primary.bold",
          outlineOffset: "2px",
        }}
      >
        <Icon as={HiOutlineSearch} fontSize="md" />
        <styled.span hideBelow="md">Search docs</styled.span>
        <styled.kbd
          hideBelow="md"
          ml="auto"
          flex="none"
          fontFamily="mono"
          fontSize="12px"
          h="5"
          minW="9"
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          gap="0.5"
          wordSpacing="-0.4em"
          color="ink.muted"
        >
          {shortcut}
        </styled.kbd>
      </styled.button>
    )
  },
)
