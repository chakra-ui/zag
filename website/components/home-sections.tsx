import { ArrowRightIcon } from "components/icons"
import { Icon } from "components/ui/icon"
import { Section } from "components/ui/section"
import { docHref, tabItems } from "lib/pagination-utils"
import Link from "next/link"
import { tabs } from "sidebar.config"
import { css } from "styled-system/css"
import { Box, Grid, HStack, styled } from "styled-system/jsx"

const componentsTab = tabs.find((tab) => tab.id === "components")!

const componentCount = tabItems(componentsTab).length

const newItems = tabs.flatMap(tabItems).filter((item) => item.new)

const card = css({
  display: "flex",
  flexDirection: "column",
  gap: "2",
  p: "6",
  rounded: "xl",
  borderWidth: "1px",
  borderColor: "border.subtle",
  transition: "border-color 0.2s",
  _hover: { borderColor: "green.500" },
  _focusVisible: {
    outline: "2px solid",
    outlineColor: "green.500",
    outlineOffset: "2px",
  },
})

/** The pages marked new in the sidebar */
export function WhatsNew() {
  return (
    <Section my={{ base: "20", md: "32" }}>
      <styled.h2 textStyle="display.xl" mb="4">
        New in v2
      </styled.h2>
      <styled.p textStyle="text.lg" maxW="60ch" mb="10" color="text.muted">
        New machines and utilities, plus a{" "}
        <Link
          href="/guides/migration"
          className={css({ textDecoration: "underline" })}
        >
          migration guide
        </Link>{" "}
        for upgrading from v1.
      </styled.p>
      <Grid columns={{ base: 2, md: 4 }} gap="4">
        {newItems.map((item) => (
          <Link
            key={`${item.section}/${item.id}`}
            href={docHref(item, "react")}
            className={card}
          >
            <styled.span fontWeight="semibold">{item.label}</styled.span>
            <styled.span
              fontSize="sm"
              color="text.muted"
              textTransform="capitalize"
            >
              {item.section === "components" ? "Component" : "Utility"}
            </styled.span>
          </Link>
        ))}
      </Grid>
    </Section>
  )
}

/** The component groups from the sidebar, each linking to the full index */
export function ComponentCategories() {
  return (
    <Section my={{ base: "20", md: "32" }}>
      <HStack
        justify="space-between"
        alignItems="end"
        mb="10"
        flexWrap="wrap"
        gap="4"
      >
        <Box>
          <styled.h2 textStyle="display.xl" mb="4">
            {componentCount} components, one API
          </styled.h2>
          <styled.p textStyle="text.lg" maxW="60ch" color="text.muted">
            Every machine follows the same pattern, from a checkbox to a date
            picker.
          </styled.p>
        </Box>
        <Link
          href="/overview/components"
          className={css({ fontWeight: "semibold" })}
        >
          <HStack gap="2">
            <span>All components</span>
            <Icon as={ArrowRightIcon} />
          </HStack>
        </Link>
      </HStack>
      <Grid columns={{ base: 1, sm: 2, lg: 5 }} gap="4">
        {componentsTab.groups.map((group) => (
          <Link key={group.label} href="/overview/components" className={card}>
            <styled.span fontWeight="semibold">{group.label}</styled.span>
            <styled.span fontSize="sm" color="text.muted">
              {group.items
                .slice(0, 4)
                .map((item) => item.label)
                .join(", ")}
              {group.items.length > 4 && ` and ${group.items.length - 4} more`}
            </styled.span>
          </Link>
        ))}
      </Grid>
    </Section>
  )
}
