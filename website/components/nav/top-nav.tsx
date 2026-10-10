"use client"

import { GithubIcon, HeartIcon } from "components/icons"
import { Search } from "components/search-dialog"
import { ThemeToggle } from "components/theme-toggle"
import siteConfig from "site.config"
import { Box, Flex, HStack } from "styled-system/jsx"
import { IconLink } from "../icon-link"
import { LogoWithLink } from "../logo"
import { MobileNav } from "./mobile-nav"
import { NavLinks } from "./nav-links"
import { VersionSelect } from "./version-select"

/** `fluid` spans the full width, lining up with the docs columns */
export function TopNav(props: { fluid?: boolean }) {
  return (
    <Box
      bg="bg.subtle"
      backdropFilter="auto"
      backdropBlur="sm"
      position="sticky"
      top="0"
      width="full"
      zIndex="50"
      py="4"
      borderBottomWidth="1px"
      borderBottomColor="border.subtle"
      overflowX="hidden"
    >
      {/* search sits in the middle and gives up width before either side does */}
      <Flex
        display={{ base: "flex", md: "grid" }}
        gridTemplateColumns={{
          md: "minmax(max-content, 1fr) minmax(12rem, 28rem) minmax(max-content, 1fr)",
        }}
        alignItems="center"
        justifyContent="space-between"
        gap={{ base: "3", md: "6" }}
        maxW={props.fluid ? "none" : "8xl"}
        w="full"
        mx="auto"
        px={
          props.fluid ? { base: "4", md: "6" } : { base: "4", sm: "6", md: "8" }
        }
      >
        <HStack gap="6">
          <HStack gap="3">
            <LogoWithLink />
            <VersionSelect />
          </HStack>
          <HStack as="nav" hideBelow="lg" gap="6">
            <NavLinks />
          </HStack>
        </HStack>
        <Box ms={{ base: "auto", md: "0" }}>
          <Search />
        </Box>
        <HStack gap="4" justifySelf="end">
          <HStack gap="4">
            <IconLink
              variant="solid"
              href={siteConfig.openCollective.url}
              icon={HeartIcon}
              label="Sponsor on OpenCollective"
            />
            <IconLink
              href={siteConfig.repo.url}
              icon={GithubIcon}
              label="View Zag.js on Github"
            />
            <ThemeToggle />
            <MobileNav />
          </HStack>
        </HStack>
      </Flex>
    </Box>
  )
}
