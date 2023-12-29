import { ChakraProvider } from "@chakra-ui/provider"
import { DefaultSeo } from "next-seo"
import siteConfig from "site.config"
import "../styles/other.css"
import "../styles/prism.css"
import theme from "../theme"

export default function App({ Component, pageProps }: any) {
  return (
    <ChakraProvider theme={theme}>
      <DefaultSeo {...siteConfig.seo} />
      <Component {...pageProps} />
    </ChakraProvider>
  )
}
