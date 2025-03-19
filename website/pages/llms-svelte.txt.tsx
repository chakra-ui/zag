import type { GetServerSideProps } from "next"
import { getComponentsPerFramework } from "lib/component-llm"

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.setHeader("Content-Type", "text/plain")

  const text = getComponentsPerFramework("svelte")

  res.write(text)
  res.end()

  return {
    props: {},
  }
}

export default function LLMsSvelteText() {
  return null
}
