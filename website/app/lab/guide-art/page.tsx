"use client"

import { GuideLogo, guideArt } from "components/lab/guide-art"
import type { DiagramKey } from "components/lab/guide-copy"
import { Box, Grid, styled } from "styled-system/jsx"

const keys = Object.keys(guideArt) as DiagramKey[]

export default function GuideArtPreview() {
  return (
    <Box maxW="1400px" mx="auto" p="6">
      <Box borderWidth="1px" borderColor="border" p="6">
        <styled.p fontFamily="mono" fontSize="11px" color="text.muted" mb="3">
          logo
        </styled.p>
        <Box maxW="760px" mx="auto">
          <GuideLogo />
        </Box>
      </Box>
      <Grid columns={{ base: 1, lg: 2 }} gap="0" mt="-1px">
        {keys.map((k) => {
          const Art = guideArt[k]
          return (
            <Box
              key={k}
              borderWidth="1px"
              borderColor="border"
              p="6"
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
              <Box maxW="640px" mx="auto">
                <Art />
              </Box>
            </Box>
          )
        })}
      </Grid>
    </Box>
  )
}
