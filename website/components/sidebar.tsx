import { Icon } from "@chakra-ui/icon"
import { Badge, Box, Flex, HStack, Stack } from "@chakra-ui/layout"
import { chakra } from "@chakra-ui/system"
import { formatUrl } from "lib/pagination-utils"
import Link, { type LinkProps } from "next/link"
import { useRouter } from "next/router"
import React from "react"
import sidebar from "sidebar.config"
import { useFramework } from "./framework"

interface DocLinkProps {
  href: LinkProps["href"]
  children: React.ReactNode
}

const sanitize = (href: string) =>
  href.replace(/#.*/, "").split("/").filter(Boolean)

function test(href: string, asPath: string) {
  const a = sanitize(href)
  const b = sanitize(asPath)

  return a[a.length - 1] === b[b.length - 1]
}

function DocLink(props: DocLinkProps) {
  const { asPath } = useRouter()
  const { href, children } = props
  const current = test(href.toString(), asPath)
  return (
    <Box key={asPath} as="li" fontSize="sm">
      <chakra.a
        as={Link}
        href={href.toString()}
        aria-current={current ? "page" : undefined}
        textStyle="sidebarLink"
      >
        {children}
      </chakra.a>
    </Box>
  )
}

export function Sidebar() {
  const { framework } = useFramework()

  return (
    <nav aria-label="Sidebar Navigation">
      <Stack as="ul" listStyleType="none" direction="column" spacing="10">
        {sidebar.docs.map((item) => {
          if (item.type === "category") {
            return (
              <li className="sidebar__category" key={item.id}>
                <HStack mb="3" color="green.500">
                  <Icon as={item.icon} />
                  <chakra.h5
                    fontSize="xs"
                    fontWeight="semibold"
                    textTransform="uppercase"
                  >
                    {item.label}
                  </chakra.h5>
                </HStack>

                <Flex as="ul" listStyleType="none" direction="column">
                  {item.items.map((subItem, index) => {
                    const href = formatUrl(item.id, subItem.id, framework)
                    if (subItem.type === "doc") {
                      return (
                        <DocLink
                          key={subItem.id + index}
                          href={subItem.href ?? href}
                        >
                          {subItem.label}{" "}
                          {subItem.new && (
                            <Badge
                              bg="purple.500"
                              color="white"
                              ms="2"
                              px="1"
                              rounded="sm"
                              fontSize="xs"
                            >
                              New
                            </Badge>
                          )}
                        </DocLink>
                      )
                    }
                    return null
                  })}
                </Flex>
              </li>
            )
          }

          return null
        })}
      </Stack>
    </nav>
  )
}
