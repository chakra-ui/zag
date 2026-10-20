"use client"

import type { DiagramKey } from "components/lab/guide-copy"
import { HLogo, HMini } from "components/lab/h-art"
import { Box, Grid, styled } from "styled-system/jsx"

const keys: DiagramKey[] = [
  "principles",
  "machines",
  "events",
  "anatomy",
  "adapters",
  "a11y",
  "styling",
]

export default function HArtPreview() {
  return (
    <Box maxW="1400px" mx="auto" p="6">
      <Box borderWidth="1px" borderColor="border" p="6">
        <styled.p fontFamily="mono" fontSize="11px" color="text.muted" mb="3">
          logo
        </styled.p>
        <Box maxW="820px" mx="auto">
          <HLogo />
        </Box>
      </Box>
      <Grid columns={{ base: 2, md: 4 }} gap="0" mt="-1px">
        {keys.map((k) => (
          <Box
            key={k}
            borderWidth="1px"
            borderColor="border"
            p="5"
            mt="-1px"
            ml="-1px"
          >
            <styled.p
              fontFamily="mono"
              fontSize="11px"
              color="text.muted"
              mb="3"
            >
              {k}
            </styled.p>
            <Box maxW="220px" mx="auto">
              <HMini kind={k} />
            </Box>
            <Box w="140px" mx="auto" mt="4" opacity="0.9">
              <HMini kind={k} />
            </Box>
          </Box>
        ))}
      </Grid>
    </Box>
  )
}
