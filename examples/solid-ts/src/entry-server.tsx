// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server"
import { prefsScript } from "~/components/shell/prefs"

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
          {/* Same font as the website */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Wix+Madefor+Text:wght@400..800&display=swap"
          />
          {/* Sets saved shell prefs on <html> before first paint */}
          <script innerHTML={prefsScript} />
          {assets}
        </head>
        <body>
          <div id="app">{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
))
