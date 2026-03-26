import { Portal } from "@zag-js/react"
import { Icon } from "components/ui/icon"
import { useSearch } from "lib/use-search"
import Link from "next/link"
import { BiSearch } from "react-icons/bi"
import { GrReturn } from "react-icons/gr"
import { HiDocument, HiHashtag } from "react-icons/hi"
import { css } from "styled-system/css"
import { Box, HStack, Stack, styled } from "styled-system/jsx"
import { SearchTrigger } from "./search-trigger"

export function Search() {
  const { dialog_api, combobox_api, results } = useSearch()

  return (
    <>
      <SearchTrigger {...dialog_api.getTriggerProps()} />
      {dialog_api.open && (
        <Portal>
          <styled.div
            position="fixed"
            inset="0"
            bg="blackAlpha.700"
            zIndex="1000"
            {...dialog_api.getBackdropProps()}
          />
          <styled.div
            display="flex"
            flexDirection="column"
            alignItems="center"
            height="100vh"
            width="100vw"
            position="fixed"
            zIndex="1000"
            inset="0"
            {...dialog_api.getPositionerProps()}
          >
            <styled.div
              mt="90px"
              width="full"
              maxW="600px"
              rounded="md"
              bg="bg"
              borderWidth="1px"
              borderColor="border"
              shadow="xl"
              position="relative"
              pointerEvents="auto"
              {...dialog_api.getContentProps()}
            >
              <styled.h2 srOnly {...dialog_api.getTitleProps()}>
                Search the docs
              </styled.h2>

              <Stack gap="0" {...combobox_api.getRootProps()}>
                <styled.div
                  height="64px"
                  display="flex"
                  alignItems="center"
                  borderBottomWidth="1px"
                  borderBottomColor="border"
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
                  <styled.input
                    width="full"
                    outline="0"
                    bg="transparent"
                    border="none"
                    fontSize="lg"
                    color="text"
                    {...combobox_api.getInputProps()}
                  />
                </styled.div>
                <styled.div
                  flex="1"
                  listStyleType="none"
                  maxHeight="340px"
                  overflowY="auto"
                  px="1"
                  {...combobox_api.getContentProps()}
                >
                  {results.map((item) => {
                    const isLvl1 = item.type === "lvl1"
                    return (
                      <Link
                        key={item.id}
                        href={item.url}
                        className={css({
                          px: "3",
                          py: "1",
                          _selected: {
                            bg: "bg.primary.bold",
                            color: "text.inverse",
                          },
                          display: "flex",
                          alignItems: "center",
                          minHeight: "14",
                          textDecoration: "none",
                        })}
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

                        <Icon
                          opacity="0.4"
                          as={GrReturn}
                          css={{ "& path": { stroke: "currentColor" } }}
                        />
                      </Link>
                    )
                  })}
                </styled.div>

                <HStack
                  px="4"
                  userSelect="none"
                  minHeight="8"
                  fontSize="xs"
                  lineHeight="1"
                  color="text.muted"
                  gap="5"
                  borderTopWidth={combobox_api.open ? "1px" : undefined}
                >
                  <HStack>↑↓ Navigate</HStack>
                  <HStack>↵ Select</HStack>
                </HStack>
              </Stack>
              <div />
            </styled.div>
          </styled.div>
        </Portal>
      )}
    </>
  )
}
