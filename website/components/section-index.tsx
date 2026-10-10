"use client"

import { docHref } from "lib/pagination-utils"
import Link from "next/link"
import { tabs } from "sidebar.config"
import { css } from "styled-system/css"
import { Box, Grid, styled } from "styled-system/jsx"
import { useFramework } from "./framework"

const link = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "2",
  fontWeight: "medium",
  _hover: { textDecoration: "underline", textUnderlineOffset: "4px" },
})

const dot = css({ boxSize: "2", rounded: "full", bg: "green.500" })

/** Every page of a docs tab, by sidebar group. Links follow the picked framework. */
export function SectionIndex(props: { tab: string }) {
  const { framework } = useFramework()
  const tab = tabs.find((tab) => tab.id === props.tab)
  if (!tab) return null

  return (
    <Box mt="8">
      {tab.groups.map((group) => (
        <Box key={group.label} mb="10">
          <styled.h2 textStyle="display.sm" mb="4">
            {group.label}
          </styled.h2>
          <Grid columns={{ base: 2, md: 3 }} columnGap="8" rowGap="3">
            {group.items.map((item) => (
              <Link
                key={`${item.section}/${item.id}`}
                href={docHref(item, framework)}
                className={link}
              >
                {item.label}
                {item.new && (
                  <span className={dot} role="img" aria-label="New" />
                )}
              </Link>
            ))}
          </Grid>
        </Box>
      ))}
    </Box>
  )
}
