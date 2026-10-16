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
        <styled.p fontWeight="semibold" color="text.primary.bold">
          404
        </styled.p>
        <styled.h1 textStyle="display.xl">Page not found</styled.h1>
        <styled.p color="text.muted" maxW="lg">
          We couldn't find this page. It may have moved, or the link might be
          wrong.
        </styled.p>

        <Stack my="10" align="center">
          <MissingState />
        </Stack>

        <HStack gap="3" flexWrap="wrap" justify="center">
          <ButtonLink href="/" variant="green">
            Go home
          </ButtonLink>
          <ButtonLink href="/overview/introduction">Read the docs</ButtonLink>
        </HStack>
        <styled.p fontSize="sm" color="text.muted" mt="2">
          Or search for it at the top of the page.
        </styled.p>
      </Stack>
      <Footer />
    </>
  )
}
