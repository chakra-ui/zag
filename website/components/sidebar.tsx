import { Link } from "components/ui/link"
import { formatUrl } from "lib/pagination-utils"
import { type LinkProps } from "next/link"
import { useRouter } from "next/router"
import React from "react"
import sidebar from "sidebar.config"
import { Box, Flex, HStack, Stack, styled } from "styled-system/jsx"
import { useFramework } from "./framework"
import { Icon } from "./ui/icon"

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
      <Link href={href.toString()} aria-current={current ? "page" : undefined}>
        {children}
      </Link>
    </Box>
  )
}

export function Sidebar() {
  const { framework } = useFramework()

  return (
    <nav aria-label="Sidebar Navigation">
      <Stack as="ul" listStyleType="none" direction="column" gap="10">
        {sidebar.docs.map((item) => {
          if (item.type === "category") {
            return (
              <li className="sidebar__category" key={item.id}>
                <HStack mb="3" color="green.500">
                  <Icon as={item.icon} />
                  <styled.h5
                    fontSize="xs"
                    fontWeight="semibold"
                    textTransform="uppercase"
                  >
                    {item.label}
                  </styled.h5>
                </HStack>

                <Stack as="ul" listStyleType="none" gap="2">
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
                            <styled.span
                              bg="purple.500"
                              color="white"
                              ms="2"
                              px="1"
                              py="0.5"
                              rounded="sm"
                              fontSize="xs"
                              fontWeight="medium"
                            >
                              New
                            </styled.span>
                          )}
                          {subItem.beta && (
                            <styled.span
                              bg="purple.50"
                              borderWidth="1px"
                              borderColor="purple.200"
                              color="purple.500"
                              ms="2"
                              px="1"
                              py="0.5"
                              rounded="sm"
                              fontSize="xs"
                              fontWeight="medium"
                              _dark={{
                                bg: "purple.900",
                                color: "purple.200",
                                borderColor: "purple.800",
                              }}
                            >
                              Beta
                            </styled.span>
                          )}
                        </DocLink>
                      )
                    }
                    return null
                  })}
                </Stack>
              </li>
            )
          }

          return null
        })}
      </Stack>
    </nav>
  )
}
