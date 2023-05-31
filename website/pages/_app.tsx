import { DefaultSeo } from "next-seo"
import "../styles/prism.css"
import "../styles/other.css"
import siteConfig from "site.config"

export default function App({ Component, pageProps }: any) {
  return (
    <>
      <DefaultSeo {...siteConfig.seo} />
      <Component {...pageProps} />
    </>
  )
}
