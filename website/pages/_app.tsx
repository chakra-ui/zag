import { ChakraProvider } from "@chakra-ui/provider"
import { DefaultSeo } from "next-seo"
import theme from "../theme_old"
import "../styles/prism.css"
import "../styles/other.css"
import siteConfig from "site.config"

export default function App({ Component, pageProps }: any) {
  return (
    <ChakraProvider theme={theme}>
      <DefaultSeo {...siteConfig.seo} />
      <Component {...pageProps} />
    </ChakraProvider>
  )
}
