import { Footer } from "components/footer"
import { MissingState } from "components/missing-state"
import { TopNav } from "components/nav/top-nav"
import { ButtonLink } from "components/ui/button"
import { HStack, Stack, styled } from "styled-system/jsx"

export default function NotFound() {
  return (
    <>
      <TopNav />
      <Stack
        as="main"
        align="center"
        textAlign="center"
        gap="4"
        px="6"
        py={{ base: "20", md: "28" }}
      >
        <styled.p
          fontFamily="mono"
          fontSize="sm"
          fontWeight="semibold"
          color="text.primary.bold"
        >
          404
        </styled.p>
        <styled.h1 textStyle="display.xl">
          No transition for this page
        </styled.h1>
        <styled.p color="text.muted" maxW="lg">
          The site got a <code>NAVIGATE</code> event for a page that isn't
          there, so it stayed where it was.
        </styled.p>

        <Stack my="10" align="center">
          <MissingState />
        </Stack>

        <styled.p fontSize="sm" color="text.muted">
          These transitions still work:
        </styled.p>
        <HStack gap="3" flexWrap="wrap" justify="center">
          <ButtonLink href="/" variant="green" fontFamily="mono">
            GO_HOME
          </ButtonLink>
          <ButtonLink href="/overview/introduction" fontFamily="mono">
            OPEN_DOCS
          </ButtonLink>
        </HStack>
        <styled.p fontSize="sm" color="text.muted" mt="2">
          Or try the search at the top of the page.
        </styled.p>
      </Stack>
      <Footer />
    </>
  )
}
