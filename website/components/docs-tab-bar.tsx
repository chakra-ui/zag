"use client"

import { docHref, getActiveTab, tabItems } from "lib/pagination-utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { tabs, type SidebarTab } from "sidebar.config"
import { css } from "styled-system/css"
import { Box, Flex, HStack } from "styled-system/jsx"
import { useFramework } from "./framework"
import { FrameworkSelect } from "./framework-select"
import { Icon } from "./ui/icon"

const tabLink = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "2",
  h: "full",
  textStyle: "sm",
  fontWeight: "medium",
  color: "text.muted",
  borderBottomWidth: "2px",
  borderBottomColor: "transparent",
  transition: "color 0.2s",
  _hover: { color: "text" },
  _currentPage: {
    color: "text",
    fontWeight: "semibold",
    borderBottomColor: "green.500",
  },
  _focusVisible: {
    outline: "2px solid",
    outlineColor: "green.500",
    outlineOffset: "-2px",
  },
})

/** A tab opens on its first docs page */
export function useTabHref() {
  const { framework } = useFramework()
  return (tab: SidebarTab) => {
    const first = tabItems(tab).find((item) => !item.href)
    return first ? docHref(first, framework) : "/"
  }
}

export function DocsTabBar() {
  const pathname = usePathname()
  const active = getActiveTab(pathname)
  const tabHref = useTabHref()

  return (
    <Box
      bg="bg.subtle"
      borderBottomWidth="1px"
      borderBottomColor="border.subtle"
      hideBelow="lg"
    >
      <Flex
        as="nav"
        aria-label="Documentation sections"
        h="12"
        px={{ base: "4", md: "6" }}
        alignItems="stretch"
        justifyContent="space-between"
      >
        <HStack gap="6" alignItems="stretch">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={tabHref(tab)}
              className={tabLink}
              aria-current={tab.id === active.id ? "page" : undefined}
            >
              <Icon as={tab.icon} />
              {tab.label}
            </Link>
          ))}
        </HStack>
        <HStack>
          <FrameworkSelect />
        </HStack>
      </Flex>
    </Box>
  )
}
