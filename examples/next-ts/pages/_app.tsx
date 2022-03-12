import { AppProps } from "next/app"
import "../../../shared/reset"
import Link from "next/link"
import { useRouter } from "next/router"

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()

  return (
    <>
      {router.pathname !== "/" && (
        <>
          <Link href="/">← Back</Link> <br />
        </>
      )}
      <Component {...pageProps} />
    </>
  )
}
