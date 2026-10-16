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
        gap="2"
        bg="bg"
        fontSize="sm"
        py="2"
        pl="2"
        pr="3"
        borderWidth="1px"
        borderColor="border"
        color="text.muted"
        cursor="pointer"
        rounded="sm"
      >
        <Icon as={HiOutlineSearch} fontSize="md" />
        <styled.span hideBelow="md">Quick search...</styled.span>
        <styled.kbd
          hideBelow="md"
          ml="auto"
          flex="none"
          fontFamily="inherit"
          fontWeight="semibold"
          fontSize="xs"
        >
          {shortcut}
        </styled.kbd>
      </styled.button>
    )
  },
)
