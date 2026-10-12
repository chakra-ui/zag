import { Portal } from "@zag-js/react"
import { Icon } from "components/ui/icon"
import { useSearch } from "lib/use-search"
import Link from "next/link"
import { BiSearch } from "react-icons/bi"
import { HiDocument, HiHashtag } from "react-icons/hi"
import { css } from "styled-system/css"
import { Box, Stack, styled } from "styled-system/jsx"
import { SearchTrigger } from "./search-trigger"

const sectionLabels: Record<string, string> = {
  overview: "Overview",
  guides: "Guides",
  components: "Components",
  utilities: "Utilities",
  blog: "Blog",
}

// secondary text, which follows the row's color once it's highlighted
const dim = css({
  color: "text.muted",
  "[data-highlighted] &": { color: "inherit" },
})

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
                        key={item.url}
                        href={item.url}
                        className={css({
                          px: "3",
                          py: "1",
                          _highlighted: {
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

                        <Box flex="1" minW="0" ml="4">
                          {!isLvl1 && (
                            <Box
                              fontWeight="medium"
                              fontSize="xs"
                              className={dim}
                            >
                              {item.hierarchy.lvl1}
                            </Box>
                          )}
                          <Box fontWeight="semibold">{item.content}</Box>
                          {item.text && (
                            <Box fontSize="sm" truncate className={dim}>
                              {item.text}
                            </Box>
                          )}
                        </Box>

                        <Box
                          flexShrink="0"
                          ms="3"
                          fontSize="xs"
                          fontWeight="medium"
                          className={dim}
                        >
                          {sectionLabels[item.url.split("/")[1]]}
                        </Box>
                      </Link>
                    )
                  })}
                </styled.div>
              </Stack>
              <div />
            </styled.div>
          </styled.div>
        </Portal>
      )}
    </>
  )
}
