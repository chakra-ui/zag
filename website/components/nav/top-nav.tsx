"use client"

import { GithubIcon, HeartIcon } from "components/icons"
import { Search } from "components/search-dialog"
import { ThemeToggle } from "components/theme-toggle"
import siteConfig from "site.config"
import { css, cx } from "styled-system/css"
import { Box, Flex, HStack } from "styled-system/jsx"
import { LogoWithLink } from "../logo"
import { navCluster, navControl } from "./control"
import { MobileNav } from "./mobile-nav"
import { NavLinks } from "./nav-links"
import { VersionSelect } from "./version-select"

const wide = css({ hideBelow: "md" })

export function TopNav() {
  return (
    <Box
      bg={{ base: "bg.page", _dark: "bg.page/80" }}
      backdropFilter="auto"
      backdropBlur="md"
      position="sticky"
      top="0"
      width="full"
      zIndex="50"
      borderBottomWidth="1px"
      borderBottomColor="border"
    >
      <Flex
        alignItems="center"
        justifyContent="space-between"
        gap={{ base: "3", md: "6" }}
        maxW="8xl"
        w="full"
        h="14"
        mx="auto"
        px={{ base: "4", sm: "6", md: "8" }}
      >
        <HStack gap="8" h="full">
          <HStack gap="3">
            <LogoWithLink />
            <VersionSelect />
          </HStack>
          <HStack as="nav" aria-label="Main" hideBelow="lg" gap="6" h="full">
            <NavLinks />
          </HStack>
        </HStack>
        <HStack gap="2" ms="auto">
          <Box w={{ md: "60" }}>
            <Search />
          </Box>
          <div className={navCluster}>
            <a
              className={cx(navControl, wide)}
              href={siteConfig.openCollective.url}
              target="_blank"
              rel="noreferrer"
              aria-label="Sponsor on OpenCollective"
            >
              <HeartIcon />
            </a>
            <a
              className={cx(navControl, wide)}
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
    </Box>
  )
}
