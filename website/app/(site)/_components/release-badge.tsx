import Link from "next/link"
import { styled } from "styled-system/jsx"

export function ReleaseBadge() {
  return (
    <Link href="/guides/migration">
      <styled.span
        display="inline-flex"
        alignItems="center"
        gap="2.5"
        h="8"
        ps="1"
        pe="3.5"
        borderWidth="1px"
        borderColor={{ base: "green.200", _dark: "green.900" }}
        bg={{ base: "green.50", _dark: "green.950" }}
        borderRadius="full"
        fontFamily="mono"
        fontSize="12px"
        color={{ base: "green.800", _dark: "green.200" }}
        transition="border-color 160ms, background 160ms"
        _hover={{
          borderColor: { base: "green.400", _dark: "green.700" },
          bg: { base: "green.100", _dark: "green.900" },
        }}
      >
        <styled.span
          display="inline-flex"
          alignItems="center"
          h="6"
          px="2.5"
          borderRadius="full"
          bg={{ base: "green.600", _dark: "green.400" }}
          color={{ base: "white", _dark: "gray.950" }}
          fontWeight="semibold"
        >
          v2
        </styled.span>
        <span>pre-release · see what changed →</span>
      </styled.span>
    </Link>
  )
}
