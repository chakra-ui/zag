import "regenerator-runtime/runtime"
import { AppProps } from "next/app"
import "../../../shared/reset"

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
