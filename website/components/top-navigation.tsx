import { Badge, Box, Flex, HStack } from "@chakra-ui/layout"
import packageJson from "@zag-js/react/package.json"
import { GithubIcon } from "components/icons"
import { ThemeToggle } from "components/theme-toggle"
import { FaDiscord } from "react-icons/fa"
import siteConfig from "site.config"
import { IconLink } from "./icon-link"
import { LogoWithLink } from "./logo"
import { MobileNavigation } from "./mobile-navigation"
// import { WorkshopLink } from "./workshop-link"

export function TopNavigation() {
  return (
    <Box
      bg="bg-header"
      backdropFilter="auto"
      backdropBlur="sm"
      position="sticky"
      top="0"
      width="full"
      zIndex={50}
      py="4"
      borderBottomWidth="1px"
      borderBottomColor="border-subtle"
      overflowX="hidden"
    >
      <Flex
        align="center"
        justify="space-between"
        maxW="8xl"
        mx="auto"
        px={{ base: "4", sm: "6", md: "8" }}
      >
        <HStack spacing="3">
          <LogoWithLink />
          <Badge
            color="text-badge"
            bg="bg-badge"
            rounded="sm"
            px="2"
            py="0.5"
            fontSize="xs"
            letterSpacing="wider"
            fontWeight="semibold"
            display={{ base: "none", sm: "block" }}
            borderBottomColor="border-subtle"
          >
            {packageJson.version}
          </Badge>
          {/* <WorkshopLink /> */}
        </HStack>
        <HStack spacing="4">
          <nav hidden>
            <HStack
              as="ul"
              spacing="8"
              listStyleType="none"
              fontWeight="semibold"
              fontSize="sm"
            >
              <li>Tutorials</li>
              <li>API</li>
              <li>Components</li>
            </HStack>
          </nav>
          <HStack spacing="4">
            <IconLink
              href={siteConfig.repo.url}
              icon={GithubIcon}
              label="View Zag.js on Github"
            />
            <IconLink
              href={siteConfig.discord.url}
              icon={FaDiscord}
              label="Join the Discord server"
            />
            <ThemeToggle />
            <MobileNavigation />
          </HStack>
        </HStack>
      </Flex>
    </Box>
  )
}
