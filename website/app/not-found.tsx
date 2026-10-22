import { Footer } from "components/footer"
import { IsoNotFound } from "components/illustrations/not-found"
import { Btn, Eyebrow, Frame, Lead, Pad, Title } from "components/ui/layout"
import { TopNav } from "components/nav/top-nav"
import { Box, Grid, HStack, styled } from "styled-system/jsx"

const accent = { base: "#2f855a", _dark: "#48bb78" }

export default function NotFound() {
  return (
    <Box>
      <TopNav />
      <Frame>
        <Grid
          as="main"
          columns={{ base: 1, lg: 2 }}
          gap="0"
          alignItems="center"
        >
          <Pad py={{ base: "16", md: "24" }}>
            <Eyebrow mb="3">
              404 · state <styled.span color={accent}>not_found</styled.span>
            </Eyebrow>
            <Title as="h1">This page isn&apos;t in any state we know</Title>
            <Lead mt="4">
              The link may be old, or the page may have moved. Here are a few
              places that definitely exist.
            </Lead>

            <HStack gap="3" flexWrap="wrap" mt={{ base: "10", md: "12" }}>
              <Btn href="/">Go home</Btn>
              <Btn href="/overview/introduction" tone="ghost">
                Read the docs
              </Btn>
              <Btn href="/components/react/accordion" tone="ghost">
                Browse components
              </Btn>
            </HStack>
            <styled.p mt="5" fontSize="14px" color="text.muted">
              Looking for something specific? Press{" "}
              <styled.kbd
                fontFamily="mono"
                fontSize="12px"
                px="1.5"
                py="0.5"
                borderWidth="1px"
                borderColor="border"
                borderRadius="sm"
                color="text.bold"
              >
                ⌘K
              </styled.kbd>{" "}
              or{" "}
              <styled.kbd
                fontFamily="mono"
                fontSize="12px"
                px="1.5"
                py="0.5"
                borderWidth="1px"
                borderColor="border"
                borderRadius="sm"
                color="text.bold"
              >
                Ctrl K
              </styled.kbd>{" "}
              to search.
            </styled.p>
          </Pad>
          <Box
            borderLeftWidth={{ base: "0", lg: "1px" }}
            borderTopWidth={{ base: "1px", lg: "0" }}
            borderColor="border"
            p={{ base: "4", md: "10" }}
            h="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Box w="full" maxW="580px">
              <IsoNotFound />
            </Box>
          </Box>
        </Grid>
        <Box borderTopWidth="1px" borderColor="border" />
      </Frame>
      <Footer />
    </Box>
  )
}
