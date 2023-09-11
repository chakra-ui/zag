import { Icon } from "@chakra-ui/icon"
import { Box, Flex, HStack, Text } from "@chakra-ui/layout"
import { chakra } from "@chakra-ui/system"
import { useSearch } from "lib/use-search"
import Link from "next/link"
import { BiSearch } from "react-icons/bi"
import { GrReturn } from "react-icons/gr"
import { HiDocument, HiHashtag } from "react-icons/hi"
import { SearchTrigger } from "./search-trigger"
import { Portal } from "@zag-js/react"

export function Search() {
  const { dialog_api, combobox_api, results } = useSearch()

  return (
    <>
      <SearchTrigger {...dialog_api.triggerProps} />
      {dialog_api.isOpen && (
        <Portal>
          <Box
            position="fixed"
            inset="0"
            bg="blackAlpha.700"
            zIndex="modal"
            {...dialog_api.backdropProps}
          />
          <Flex
            direction="column"
            align="center"
            height="100vh"
            width="100vw"
            position="fixed"
            zIndex="modal"
            inset="0"
            {...dialog_api.containerProps}
          >
            <Box
              mt="90px"
              width="full"
              maxW="600px"
              rounded="md"
              bg="bg-subtle"
              position="relative"
              pointerEvents="auto"
              {...dialog_api.contentProps}
            >
              <chakra.h2 srOnly {...dialog_api.titleProps}>
                Search the docs
              </chakra.h2>

              <Box
                display="flex"
                flexDirection="column"
                {...combobox_api.rootProps}
              >
                <Flex
                  height="64px"
                  align="center"
                  borderBottomWidth="1px"
                  position="relative"
                  fontSize="lg"
                  px="4"
                >
                  <Icon
                    as={BiSearch}
                    color="gray.300"
                    mr="4"
                    fontSize="1.3em"
                  />
                  <chakra.input
                    width="full"
                    outline="0"
                    bg="bg-subtle"
                    {...combobox_api.inputProps}
                  />
                </Flex>
                <Box
                  as="ul"
                  flex="1"
                  listStyleType="none"
                  maxHeight="340px"
                  overflowY="auto"
                  px="1"
                  {...combobox_api.contentProps}
                >
                  {results.map((item) => {
                    const isLvl1 = item.type === "lvl1"
                    return (
                      <Link key={item.id} href={item.url}>
                        <chakra.li
                          px="3"
                          py="1"
                          _selected={{
                            bg: "bg-primary-subtle",
                          }}
                          display="flex"
                          alignItems="center"
                          minHeight="14"
                          key={item.url}
                          {...combobox_api.getItemProps({ item })}
                        >
                          <Icon
                            as={isLvl1 ? HiDocument : HiHashtag}
                            opacity={0.4}
                          />

                          <Box flex="1" ml="4">
                            {!isLvl1 && (
                              <Box
                                fontWeight="medium"
                                fontSize="xs"
                                opacity={0.7}
                              >
                                {item.hierarchy.lvl1}
                              </Box>
                            )}
                            <Box fontWeight="semibold">{item.content}</Box>
                          </Box>

                          <Icon opacity={0.4}>
                            <GrReturn className="icon-gr-return" />
                          </Icon>
                        </chakra.li>
                      </Link>
                    )
                  })}
                </Box>

                <HStack
                  px="4"
                  align="center"
                  userSelect="none"
                  minHeight="8"
                  fontSize="xs"
                  lineHeight="1"
                  color="gray.500"
                  spacing="5"
                  borderTopWidth={combobox_api.isOpen ? "1px" : undefined}
                >
                  <HStack>
                    <Box as="span">↑↓</Box>
                    <Text>Select</Text>
                  </HStack>
                  <HStack>
                    <Box as="span">↵</Box>
                    <Text>Open</Text>
                  </HStack>
                </HStack>
              </Box>
              <div />
            </Box>
          </Flex>
        </Portal>
      )}
    </>
  )
}
