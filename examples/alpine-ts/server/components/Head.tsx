export default function Head() {
  return (
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <link rel="icon" type="image/svg+xml" href="/nitro.svg" />
      <title>Nitro + Vite</title>
      <slot />
    </head>
  )
}
