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
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  gap: "2",
  h: "full",
  fontSize: "13px",
  color: "text.muted",
  transition: "color 120ms",
  "& svg": { boxSize: "3.5", opacity: "0.7" },
  _hover: { color: "text.bold" },
  _currentPage: {
    color: "text.bold",
    "& svg": { opacity: "1" },
    _after: {
      content: '""',
      position: "absolute",
      left: "0",
      right: "0",
      bottom: "-1px",
      h: "1px",
      bg: "text.bold",
    },
  },
  outline: "none",
  "&:focus-visible > span": {
    outline: "2px solid",
    outlineColor: "border.primary.bold",
    outlineOffset: "4px",
    rounded: "xs",
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
      bg="bg/80"
      backdropFilter="auto"
      backdropBlur="md"
      borderBottomWidth="1px"
      borderBottomColor="border"
      hideBelow="lg"
    >
      <Flex
        as="nav"
        aria-label="Documentation sections"
        h="12"
        maxW="8xl"
        mx="auto"
        px={{ base: "4", sm: "6", md: "8" }}
        alignItems="stretch"
        justifyContent="space-between"
      >
        <HStack gap="6" alignItems="stretch" h="full">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={tabHref(tab)}
              className={tabLink}
              aria-current={tab.id === active.id ? "page" : undefined}
            >
              <Icon as={tab.icon} />
              <span>{tab.label}</span>
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
