export function Head() {
  return (
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <link rel="icon" type="image/svg+xml" href="/nitro.svg" />
      <script type="module" src="/scripts/toolbar.ts"></script>
      <script type="module" src="/scripts/state-visualizer.ts"></script>
      <script type="module" src="/scripts/style.ts"></script>
      <title>Nitro + Vite</title>
      <slot />
    </head>
  )
}
