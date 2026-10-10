import { Footer } from "components/footer"
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
        py={{ base: "24", md: "32" }}
      >
        <styled.p fontWeight="semibold" color="text.primary.bold">
          404
        </styled.p>
        <styled.h1 textStyle="display.lg">This page doesn't exist</styled.h1>
        <styled.p color="text.muted" maxW="md">
          It may have moved when the docs were reorganized. Try search, or start
          from one of these.
        </styled.p>
        <HStack gap="3" mt="4" flexWrap="wrap" justify="center">
          <ButtonLink href="/overview/introduction">Introduction</ButtonLink>
          <ButtonLink href="/overview/components">All components</ButtonLink>
        </HStack>
      </Stack>
      <Footer />
    </>
  )
}
