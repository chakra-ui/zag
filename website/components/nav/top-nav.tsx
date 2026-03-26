"use client"

import { GithubIcon, HeartIcon } from "components/icons"
import { ThemeToggle } from "components/theme-toggle"
import siteConfig from "site.config"
import { Box, Flex, HStack } from "styled-system/jsx"
import { IconLink } from "../icon-link"
import { LogoWithLink } from "../logo"
import { MobileNav } from "./mobile-nav"
import { NavLinks } from "./nav-links"
import { VersionSelect } from "./version-select"

export function TopNav() {
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
      <Flex
        alignItems="center"
        justifyContent="space-between"
        maxW="8xl"
        w="full"
        mx="auto"
        px={{ base: "4", sm: "6", md: "8" }}
      >
        <HStack gap="3">
          <LogoWithLink />
          <VersionSelect />
        </HStack>
        <HStack gap="4">
          <HStack as="nav" hideBelow="md" gap="6" me="6">
            <NavLinks />
          </HStack>
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
