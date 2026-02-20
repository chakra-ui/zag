"use client"

import { GithubIcon, HeartIcon } from "components/icons"
import { ThemeToggle } from "components/theme-toggle"
import Link from "next/link"
import siteConfig from "site.config"
import { css } from "styled-system/css"
import { Box, Flex, HStack } from "styled-system/jsx"
import { IconLink } from "./icon-link"
import { LogoWithLink } from "./logo"
import { MobileNavigation } from "./mobile-navigation"
import { VersionSelector } from "./version-selector"

export function TopNavigation() {
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
          <VersionSelector />
        </HStack>
        <HStack gap="4">
          <nav>
            <HStack
              as="ul"
              gap="6"
              listStyleType="none"
              fontWeight="medium"
              fontSize="sm"
              display={{ base: "none", md: "flex" }}
            >
              <li>
                <Link
                  href="/showcase"
                  className={css({
                    color: "fg.muted",
                    _hover: { color: "fg" },
                  })}
                >
                  Showcase
                </Link>
              </li>
            </HStack>
          </nav>
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
            <MobileNavigation />
          </HStack>
        </HStack>
      </Flex>
    </Box>
  )
}
