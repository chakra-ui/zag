"use client"

import { GithubIcon } from "components/icons"
import { Search } from "components/search-dialog"
import { ThemeToggle } from "components/theme-toggle"
import siteConfig from "site.config"
import { css, cx } from "styled-system/css"
import { container, wideContainer } from "theme/layout"
import { Box, Flex, HStack } from "styled-system/jsx"
import { LogoWithLink } from "../logo"
import { navCluster, navControl } from "./control"
import { MobileNav } from "./mobile-nav"
import { NavLinks } from "./nav-links"
import { VersionSelect } from "./version-select"

const hideOnMobile = css({ hideBelow: "md" })

interface TopNavProps {
  /** lines the header up with the docs columns */
  wide?: boolean
  /** a second row, e.g. the docs sections */
  children?: React.ReactNode
}

export function TopNav(props: TopNavProps) {
  return (
    <Box
      as="header"
      bg="canvas/72"
      backdropFilter="blur(12px) saturate(1.4)"
      position="sticky"
      top="0"
      width="full"
      zIndex="50"
    >
      <Flex
        alignItems="center"
        justifyContent="space-between"
        gap={{ base: "3", md: "6" }}
        className={css(props.wide ? wideContainer : container)}
        w="full"
        h="60px"
      >
        <HStack gap="8" h="full">
          <HStack gap="3">
            <LogoWithLink />
            <VersionSelect />
          </HStack>
          <HStack as="nav" aria-label="Main" hideBelow="lg" gap="28px" h="full">
            <NavLinks />
          </HStack>
        </HStack>
        <HStack gap="2" ms="auto">
          <Box w={{ md: "200px" }}>
            <Search />
          </Box>
          <div className={navCluster}>
            <a
              className={cx(navControl, hideOnMobile)}
              href={siteConfig.repo.url}
              target="_blank"
              rel="noreferrer"
              aria-label="View Zag.js on GitHub"
            >
              <GithubIcon />
            </a>
            <ThemeToggle className={navControl} />
            <MobileNav className={navControl} />
          </div>
        </HStack>
      </Flex>
      {props.children}
    </Box>
  )
}
