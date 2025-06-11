import { Box, Stack } from "@chakra-ui/layout"
import Link from "next/link"
import { LuSparkle } from "react-icons/lu"
import { Button } from "./button"

export const SupportAd = () => {
  return (
    <Box
      maxW="200px"
      mt="8"
      outline="1px solid"
      outlineColor="border-bold"
      bg="bg-subtle"
      borderRadius="md"
    >
      <Stack gap="2" pos="relative" padding="4">
        <Box fontSize="xl" fontWeight="semibold" lineHeight="1.4">
          <Box as="span" color="text-primary-bold">
            Pro Support <br />
          </Box>{" "}
          and Training{" "}
          <Box
            as={LuSparkle}
            pos="absolute"
            top="5"
            right="5"
            color="text-primary-bold"
          />
        </Box>
        <Box fontSize="sm" color="text-subtle">
          Supercharge your team with support from the creators of Zag.js
        </Box>
        <Button
          size="sm"
          variant="outline"
          mt="3"
          py="2"
          borderWidth="2px"
          borderColor="border-primary-subtle"
          pos="unset"
          as={Link}
          href="https://chakra-pro.lemonsqueezy.com/buy/604cf94a-e4c4-4199-aeb6-a27afc30c815"
          target="_blank"
          referrerPolicy="no-referrer"
          _before={{
            content: "''",
            position: "absolute",
            inset: 0,
            zIndex: 0,
          }}
        >
          Get Pro Support
        </Button>
      </Stack>
    </Box>
  )
}
